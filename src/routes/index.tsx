export default function Index() {
  return (
    <body>
      backend
      failed 3 minutes ago in 1m 58s
      Search logs
      1s
      0s
      1s
      1m 53s
      Run bash scripts/deploy-ftps.sh out ***
      Installing lftp...
      Selecting previously unselected package lftp.
      (Reading database ... 
      (Reading database ... 5%
      (Reading database ... 10%
      (Reading database ... 15%
      (Reading database ... 20%
      (Reading database ... 25%
      (Reading database ... 30%
      (Reading database ... 35%
      (Reading database ... 40%
      (Reading database ... 45%
      (Reading database ... 50%
      (Reading database ... 55%
      (Reading database ... 60%
      (Reading database ... 65%
      (Reading database ... 70%
      (Reading database ... 75%
      (Reading database ... 80%
      (Reading database ... 85%
      (Reading database ... 90%
      (Reading database ... 95%
      (Reading database ... 100%
      (Reading database ... 202954 files and directories currently installed.)
      Preparing to unpack .../lftp_4.9.2-2ubuntu1.1_amd64.deb ...
      Unpacking lftp (4.9.2-2ubuntu1.1) ...
      Setting up lftp (4.9.2-2ubuntu1.1) ...
      Processing triggers for hicolor-icon-theme (0.17-2) ...
      Processing triggers for man-db (2.12.0-4build2) ...
      Not building database; man-db/auto-update is not 'true'.
      Running kernel seems to be up-to-date.
      No services need to be restarted.
      No containers need to be restarted.
      No user sessions are running outdated binaries.
      No VM guests are running outdated hypervisor (qemu) binaries on this host.
      🔎 FTP host resolves to: 
      ⬆️  FTPS deploy: out -> ftp://14.128.14.142:21/***
      mirror: Fatal error: max-retries exceeded
      Error: Process completed with exit code 1.
      0s
      0s
      0s
      0s
      Node 20 is being deprecated. This workflow is running with Node 24 by default. If you need to temporarily use Node 20, you can set the ACTIONS_ALLOW_USE_UNSECURE_NODE_VERSION=true environment variable. For more information see: https://github.blog/changelog/2025-09-19-deprecation-of-node-20-on-github-actions-runners/
      Run actions/upload-artifact@v4
      0s
      Node 20 is being deprecated. This workflow is running with Node 24 by default. If you need to temporarily use Node 20, you can set the ACTIONS_ALLOW_USE_UNSECURE_NODE_VERSION=true environment variable. For more information see: https://github.blog/changelog/2025-09-19-deprecation-of-node-20-on-github-actions-runners/
      Post job cleanup.
      /usr/bin/git version
      git version 2.54.0
      Temporarily overriding HOME='/home/runner/work/_temp/0173ec0e-4faf-4975-81a6-a7a08d7d29a4' before making global git config changes
      Adding repository directory to the temporary git global config as a safe directory
      /usr/bin/git config --global --add safe.directory /home/runner/work/unitefoundation_Update/unitefoundation_Update
      /usr/bin/git config --local --name-only --get-regexp core\.sshCommand
      /usr/bin/git submodule foreach --recursive sh -c "git config --local --name-only --get-regexp 'core\.sshCommand' && git config --local --unset-all 'core.sshCommand' || :"
      /usr/bin/git config --local --name-only --get-regexp http\.https\:\/\/github\.com\/\.extraheader
      http.https://github.com/.extraheader
      /usr/bin/git config --local --unset-all http.https://github.com/.extraheader
      /usr/bin/git submodule foreach --recursive sh -c "git config --local --name-only --get-regexp 'http\.https\:\/\/github\.com\/\.extraheader' && git config --local --unset-all 'http.https://github.com/.extraheader' || :"
      /usr/bin/git config --local --name-only --get-regexp ^includeIf\.gitdir:
      /usr/bin/git submodule foreach --recursive git config --local --show-origin --name-only --get-regexp remote.origin.url
    </body>
  );
}
