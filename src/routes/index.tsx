import React from 'react';

export default function Scratchpad() {
  return (
    <div className="p-8 font-mono whitespace-pre-wrap text-sm">
      {`backend
failed 5 minutes ago in 8m 43s
Search logs
1s
1s
0s
8m 37s
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
Error: Process completed with exit code 1.`}
    </div>
  );
}
