#!/usr/bin/env python3
"""Verify a cPanel/Passenger release and leave a persistent diagnosis artifact."""

import argparse
import datetime as dt
import json
import os
import subprocess
import sys
import time
from pathlib import Path


def utc_now():
    return dt.datetime.now(dt.timezone.utc).isoformat()


def request_health(url, host, origin_ip):
    marker = "__DEPLOY_HTTP_STATUS__:"
    content_marker = "__DEPLOY_CONTENT_TYPE__:"
    command = [
        "curl", "-sS", "--connect-timeout", "5", "--max-time", "8",
        "--resolve", f"{host}:443:{origin_ip}",
        "-H", "Cache-Control: no-cache, no-store",
        "-H", "Accept: application/json",
        "-w", f"\n{marker}%{{http_code}}\n{content_marker}%{{content_type}}",
        f"{url}?cb={time.time_ns()}",
    ]
    result = subprocess.run(command, capture_output=True, text=True, check=False)
    output = result.stdout.rstrip()
    status_output, content_separator, content_type = output.rpartition(f"\n{content_marker}")
    if not content_separator:
        status_output, content_type = output, ""
    raw, separator, status_text = status_output.rpartition(f"\n{marker}")
    if not separator:
        raw, status_text = output, "000"
    try:
        http_status = int(status_text)
    except (TypeError, ValueError):
        http_status = 0
    raw = raw.strip()
    try:
        payload = json.loads(raw)
    except (json.JSONDecodeError, TypeError):
        payload = None
    return result.returncode, http_status, content_type.strip(), raw, result.stderr.strip(), payload


def diagnose(payload, expected_sha, remote_path, non_json_response=None):
    if not isinstance(payload, dict):
        if non_json_response:
            status = non_json_response.get("httpStatus")
            content_type = non_json_response.get("contentType") or "not reported"
            preview = non_json_response.get("responsePreview") or "empty body"
            return (
                "ROUTING_MISMATCH",
                f"The deploy health URL repeatedly returned HTTP {status} as '{content_type}', not JSON. "
                f"The request is reaching a web-server/vhost route instead of the Passenger API. "
                f"Response preview: {preview}",
            )
        return (
            "NO_JSON_RESPONSE",
            "API did not return JSON. Passenger/app routing or startup is failing; inspect the cPanel Passenger error log.",
        )

    live_sha = str(payload.get("release") or "")
    if live_sha == expected_sha:
        return "LIVE", "The running backend is serving the expected commit."

    app_root = str(payload.get("appRoot") or "")
    if not app_root:
        return (
            "STALE_DIAGNOSTIC_CODE",
            "The live worker is still running code from before deployment diagnostics existed. The verified upload directory is not the active Application Root, or Passenger did not restart.",
        )

    normalized_remote = remote_path.strip("/")
    if normalized_remote and not app_root.rstrip("/").endswith(f"/{normalized_remote}"):
        return (
            "APPLICATION_ROOT_MISMATCH",
            f"Passenger runs from '{app_root}', but GitHub uploads to '{remote_path}'. Set BACKEND_REMOTE_PATH to the FTP-relative path mapping to that Application Root.",
        )
    if not payload.get("releaseFileFound"):
        return (
            "RELEASE_FILE_MISSING_IN_APP_ROOT",
            "DEPLOY_RELEASE is absent from Passenger's Application Root although the upload copy was verified. The upload and running directories differ.",
        )
    if live_sha != expected_sha:
        restart_mtime = payload.get("restartMtime")
        started_at = payload.get("startedAt")
        if not restart_mtime:
            return "RESTART_MARKER_MISSING", "Passenger's Application Root has no tmp/restart.txt marker."
        if started_at and restart_mtime and str(started_at) < str(restart_mtime):
            return (
                "PASSENGER_NOT_RECYCLED",
                "tmp/restart.txt is newer than the worker, so Passenger did not recycle the process. Restart the app once from cPanel and inspect Passenger logs.",
            )
        return (
            "RUNNING_ROOT_HAS_OLD_RELEASE",
            "Passenger restarted but its Application Root still contains an old DEPLOY_RELEASE marker; check for a second backend copy or startup rollback.",
        )
    return "UNKNOWN", "Deployment state could not be classified."


def write_summary(report, summary_path):
    final = report["final"]
    lines = [
        "## Backend deployment tracker",
        "",
        "| Signal | Value |",
        "|---|---|",
        f"| Expected commit | `{report['expectedSha']}` |",
        f"| Uploaded path | `{report['remotePath']}` |",
        f"| Upload marker verified | `{str(report['uploadMarkerVerified']).lower()}` |",
        f"| Live commit | `{final.get('liveSha') or 'unavailable'}` |",
        f"| Running Application Root | `{final.get('appRoot') or 'not reported by live code'}` |",
        f"| restart.txt mtime | `{final.get('restartMtime') or 'not reported'}` |",
        f"| Worker started | `{final.get('startedAt') or 'not reported'}` |",
        f"| Result | **{report['diagnosisCode']}** |",
        "",
        f"**Diagnosis:** {report['diagnosis']}",
        "",
        "The complete attempt history is available in the `backend-deploy-tracker` artifact.",
    ]
    with open(summary_path, "a", encoding="utf-8") as handle:
        handle.write("\n".join(lines) + "\n")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--expected-sha", required=True)
    parser.add_argument("--remote-path", required=True)
    parser.add_argument("--origin-ip", required=True)
    parser.add_argument("--method", required=True, choices=("ftps", "ssh", "api"))
    parser.add_argument("--url", default="https://api.unitefoundation.bd/health/deploy")
    # cPanel Passenger can take over five minutes to recycle after restart.txt
    # is replaced. Twelve minutes avoids marking a successful upload as failed
    # while still leaving a finite, observable readiness deadline.
    parser.add_argument("--attempts", type=int, default=72)
    parser.add_argument("--interval", type=int, default=10)
    parser.add_argument("--required-consecutive", type=int, default=3)
    parser.add_argument("--max-consecutive-non-json", type=int, default=3)
    parser.add_argument("--output", default="deploy-tracker/backend.json")
    args = parser.parse_args()

    host = args.url.split("/", 3)[2]
    report = {
        "expectedSha": args.expected_sha,
        "remotePath": args.remote_path,
        "originIp": args.origin_ip,
        "method": args.method,
        "startedAt": utc_now(),
        "uploadMarkerVerified": args.method == "ftps",
        "attempts": [],
    }
    live = False
    consecutive_matches = 0
    consecutive_non_json = 0
    last_non_json = None
    final_payload = {}
    for number in range(1, args.attempts + 1):
        code, http_status, content_type, raw, stderr, payload = request_health(args.url, host, args.origin_ip)
        final_payload = payload if isinstance(payload, dict) else {}
        live_sha = str(final_payload.get("release") or "")
        report["attempts"].append({
            "attempt": number,
            "at": utc_now(),
            "curlExitCode": code,
            "httpStatus": http_status,
            "contentType": content_type or None,
            "liveSha": live_sha or None,
            "response": payload if isinstance(payload, dict) else raw[:1000],
            "stderr": stderr[:500] or None,
        })
        print(
            f"attempt {number}/{args.attempts} -> HTTP {http_status or 'unavailable'}, "
            f"content-type '{content_type or 'unavailable'}', release '{live_sha or 'unavailable'}'",
            flush=True,
        )
        if not isinstance(payload, dict) and 200 <= http_status < 400:
            consecutive_non_json += 1
            compact_preview = " ".join(raw[:300].split()) or "empty body"
            last_non_json = {
                "httpStatus": http_status,
                "contentType": content_type,
                "responsePreview": compact_preview,
            }
            if consecutive_non_json >= args.max_consecutive_non_json:
                print(
                    f"Stopping after {consecutive_non_json} consecutive non-JSON success responses; "
                    "further retries cannot fix a vhost/routing mismatch.",
                    flush=True,
                )
                break
        else:
            consecutive_non_json = 0
        if live_sha == args.expected_sha:
            consecutive_matches += 1
            if consecutive_matches >= args.required_consecutive:
                live = True
                break
        else:
            consecutive_matches = 0
        if number < args.attempts:
            time.sleep(args.interval)

    diagnosis_code, diagnosis = diagnose(
        final_payload or None,
        args.expected_sha,
        args.remote_path,
        last_non_json,
    )
    report["finishedAt"] = utc_now()
    report["success"] = live
    report["diagnosisCode"] = diagnosis_code
    report["diagnosis"] = diagnosis
    report["final"] = {
        "liveSha": final_payload.get("release"),
        "appRoot": final_payload.get("appRoot"),
        "releaseFileFound": final_payload.get("releaseFileFound"),
        "releaseFileMtime": final_payload.get("releaseFileMtime"),
        "restartMtime": final_payload.get("restartMtime"),
        "startedAt": final_payload.get("startedAt"),
        "uptimeSeconds": final_payload.get("uptimeSeconds"),
    }

    output = Path(args.output)
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(report, indent=2, ensure_ascii=False), encoding="utf-8")
    summary_path = os.environ.get("GITHUB_STEP_SUMMARY")
    if summary_path:
        write_summary(report, summary_path)

    print(f"DEPLOY DIAGNOSIS: {diagnosis_code}\n{diagnosis}", file=sys.stderr if not live else sys.stdout)
    return 0 if live else 1


if __name__ == "__main__":
    raise SystemExit(main())