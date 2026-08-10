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
      <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded text-red-900">
        <h2 className="font-bold text-lg mb-2">Analysis:</h2>
        <p>ডিপ্লয়মেন্ট এখনো <strong>max-retries exceeded</strong> এরর দিচ্ছে। এর সম্ভাব্য কারণগুলো:</p>
        <ul className="list-disc ml-6 mt-2">
          <li><strong>Firewall Block:</strong> cPanel এর সার্ভার (CSF/LFD) হয়তো GitHub Actions এর IP গুলো ব্লক করছে।</li>
          <li><strong>Passive Mode Issues:</strong> FTP ডাটা ট্রান্সফারের জন্য নির্দিষ্ট পোর্ট রেঞ্জ সার্ভারে ওপেন থাকা প্রয়োজন।</li>
        </ul>
        <p className="mt-4 font-bold">পরবর্তী পদক্ষেপ:</p>
        <ol className="list-decimal ml-6 mt-2">
          <li>GitHub Secrets-এ <strong>FTP_HOST</strong> কে পুনরায় <code>ftp.unitefoundation.bd</code> করে দিন (IP এর বদলে)।</li>
          <li>আমি স্ক্রিপ্টে রিট্রাই এবং টাইমআউট আরও বাড়িয়ে দিয়েছি, এখন আবার <strong>Re-run</strong> দিয়ে দেখুন।</li>
          <li>যদি কাজ না হয়, তবে cPanel এ গিয়ে GitHub Actions এর IP রেঞ্জ হোয়াইটলিস্ট করতে হতে পারে অথবা <strong>SFTP (Port 22)</strong> ব্যবহার করার কথা ভাবতে হবে।</li>
        </ol>
      </div>
    </div>
  );
}

