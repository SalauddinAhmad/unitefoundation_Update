import React from 'react';

export default function Scratchpad() {
  return (
    <div className="p-8 font-mono whitespace-pre-wrap text-sm">
      {`backend
failed 11 minutes ago in 8m 43s
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
Error: Process completed with exit code 1.

github e ekhono erorr dicche keno`}
      
      <div className="mt-8 p-4 bg-orange-50 border border-orange-200 rounded text-orange-900">
        <h2 className="font-bold text-lg mb-2">কেন এখনো এরর দিচ্ছে? (Analysis)</h2>
        <p>DNS পরিবর্তন করার পরও যদি <strong>max-retries exceeded</strong> আসে, তবে এর কারণ হতে পারে:</p>
        <ul className="list-disc ml-6 mt-2">
          <li><strong>IP Propagation:</strong> ক্লাউডফ্লেয়ারের DNS পরিবর্তন পুরোপুরি কার্যকর হতে ৫-১০ মিনিট সময় লাগতে পারে।</li>
          <li><strong>Server Firewall:</strong> সার্ভার (cPanel/CSF) হয়তো আপনার পেমেন্ট বা ফাইল ট্রান্সফারের অধিক চেষ্টার কারণে GitHub এর IP-কে স্প্যাম মনে করে সাময়িকভাবে ব্লক করে রেখেছে।</li>
          <li><strong>FTP_HOST Secret:</strong> আপনি কি GitHub Settings-এ <code>FTP_HOST</code> হিসেবে <code>ftp.unitefoundation.bd</code> ব্যবহার করছেন? যদি সরাসরি IP ব্যবহার করে থাকেন, তবে ক্লাউডফ্লেয়ারের DNS পরিবর্তন কোনো কাজে আসবে না।</li>
        </ul>
        <p className="mt-4 font-bold">সমাধানের জন্য এটি চেক করুন:</p>
        <p>১. GitHub Secrets-এ <code>FTP_HOST</code> অবশ্যই <code>ftp.unitefoundation.bd</code> হতে হবে।</p>
        <p>২. cPanel-এ গিয়ে দেখুন কোনো IP ব্লক তালিকায় আছে কি না।</p>
      </div>
    </div>
  );
}
