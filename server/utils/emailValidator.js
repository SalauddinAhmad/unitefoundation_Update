// Shared email validator: blocks disposable/temp mail domains and obvious junk patterns.
// Used by /messages, /applications, /donations routes.

// Curated list of the most common disposable / temporary email domains (~150 entries).
// Covers 10minutemail, mailinator, guerrillamail, yopmail, tempmail, throwaway families, etc.
const DISPOSABLE_DOMAINS = new Set([
  '0-mail.com','0wnd.net','0wnd.org','10minutemail.com','10minutemail.net','10minutemail.co.uk',
  '10minutemail.de','10minutemail.us','20minutemail.com','30minutemail.com','1secmail.com',
  '1secmail.net','1secmail.org','2prong.com','33mail.com','tempmail.com','temp-mail.org',
  'temp-mail.io','temp-mail.ru','tempmail.io','tempmail.net','tempmail.us.com','tempmail.plus',
  'tempmailer.com','tempmailo.com','tempmailin.com','tmail.com','tmail.ws','tmails.net',
  'tmailinator.com','tmpmail.net','tmpmail.org','tmpeml.com','mytemp.email','mailinator.com',
  'mailinator.net','mailinator.org','mailinator2.com','mailinater.com','mailinator.info',
  'reallymymail.com','notmailinator.com','mailnator.com','binkmail.com','bobmail.info',
  'chammy.info','safetymail.info','safetypost.de','sogetthis.com','spamherelots.com',
  'suremail.info','veryrealemail.com','zippymail.info','guerrillamail.com','guerrillamail.net',
  'guerrillamail.org','guerrillamail.biz','guerrillamail.de','guerrillamailblock.com',
  'sharklasers.com','grr.la','spam4.me','pokemail.net','yopmail.com','yopmail.fr','yopmail.net',
  'cool.fr.nf','jetable.fr.nf','nospam.ze.tc','nomail.xl.cx','mega.zik.dj','speed.1s.fr',
  'courriel.fr.nf','moncourrier.fr.nf','monemail.fr.nf','monmail.fr.nf','trashmail.com',
  'trashmail.de','trashmail.net','trashmail.org','trashmail.ws','trashmail.io','trashmail.at',
  'trashmail.me','trashinbox.com','trash-mail.com','trash-mail.de','trash-mail.at',
  'trashymail.com','wegwerfmail.de','wegwerfmail.net','wegwerfmail.org','fakeinbox.com',
  'fake-mail.net','fakemail.fr','fakemailz.com','getairmail.com','getnada.com','nada.email',
  'nada.ltd','maildrop.cc','mailcatch.com','mailnesia.com','mailmoat.com','mailtemp.info',
  'mail-temporaire.fr','mail-temporaire.com','mail.tm','mail.temp-mail.org','emailondeck.com',
  'emailtemp.org','email-temp.com','emailtemporario.com.br','emailtemporanea.com','disposable.com',
  'disposablemail.com','discard.email','discardmail.com','discardmail.de','anonaddy.me',
  'anonaddy.com','burnermail.io','burnthis.email','deadaddress.com','dumpmail.de','einrot.com',
  'ez.lv','fastacura.com','fastchevy.com','fastchrysler.com','filzmail.com','h8s.org',
  'harakirimail.com','hidemail.de','hulapla.de','ieatspam.eu','ieatspam.info','inbax.tk',
  'inbox.si','incognitomail.com','incognitomail.net','incognitomail.org','junk1e.com',
  'kasmail.com','klassmaster.com','kurzepost.de','link2mail.net','litedrop.com','lroid.com',
  'mail-filter.com','mail4trash.com','mailbidon.com','mailbiz.biz','mailblocks.com','mailde.de',
  'maileater.com','mailexpire.com','mailfa.tk','mailguard.me','mailimate.com','mailin8r.com',
  'mailincubator.com','mailismagic.com','mailme.lv','mailmetrash.com','mailmoat.com','mailms.com',
  'mailnull.com','mailquack.com','mailscrap.com','mailseal.de','mailshell.com','mailsiphon.com',
  'mailslapping.com','mailslite.com','mailtothis.com','mailtrash.net','mailtv.net','mailtv.tv',
  'mailzilla.com','mailzilla.org','makemetheking.com','manybrain.com','mbx.cc','meltmail.com',
  'messagebeamer.de','mierdamail.com','mintemail.com','mjukglass.nu','mobi.web.id','moburl.com',
  'msa.minsmail.com','mt2009.com','mt2014.com','mt2015.com','myemailboxy.com','mytrashmail.com',
  'no-spam.ws','nobulk.com','noclickemail.com','nogmailspam.info','nomail2me.com','nomorespamemails.com',
  'nospam4.us','nospamfor.us','nospamthanks.info','notsharingmy.info','nowmymail.com',
  'objectmail.com','obobbo.com','odnorazovoe.ru','oneoffemail.com','onewaymail.com','onlatedotcom.info',
  'online.ms','oopi.org','opayq.com','ordinaryamerican.net','otherinbox.com','ovpn.to',
  'owlpic.com','pancakemail.com','pjjkp.com','plexolan.de','poczta.onet.pl','politikerclub.de',
  'poofy.org','pookmail.com','privacy.net','proxymail.eu','prtnx.com','punkass.com','putthisinyourspamdatabase.com',
  'qq.com','quickinbox.com','rcpt.at','recode.me','recursor.net','reliable-mail.com','rhyta.com',
  'rmqkr.net','royal.net','rppkn.com','rtrtr.com','s0ny.net','safe-mail.net','safersignup.de',
  'safetymail.info','sandelf.de','saynotospams.com','schafmail.de','selfdestructingmail.com',
  'sendspamhere.com','sharedmailbox.org','shieldedmail.com','shieldemail.com','shiftmail.com',
  'shitmail.me','shitware.nl','shortmail.net','sibmail.com','sinnlos-mail.de','slaskpost.se',
  'slopsbox.com','smellfear.com','snakemail.com','sneakemail.com','snkmail.com','sofimail.com',
  'sofort-mail.de','sogetthis.com','soodonims.com','spam.la','spam.su','spam4.me','spamavert.com',
  'spambob.com','spambob.net','spambob.org','spambog.com','spambog.de','spambog.ru','spambox.info',
  'spambox.us','spamcannon.com','spamcannon.net','spamcero.com','spamcon.org','spamcorptastic.com',
  'spamcowboy.com','spamcowboy.net','spamcowboy.org','spamday.com','spamex.com','spamfree24.com',
  'spamfree24.de','spamfree24.eu','spamfree24.info','spamfree24.net','spamfree24.org','spamgoes.com',
  'spamgourmet.com','spamgourmet.net','spamgourmet.org','spamherelots.com','spamhereplease.com',
  'spamhole.com','spamify.com','spaminator.de','spamkill.info','spaml.com','spaml.de','spammotel.com',
  'spamobox.com','spamoff.de','spamsalad.in','spamslicer.com','spamsphere.com','spamspot.com',
  'spamthis.co.uk','spamthisplease.com','spamtrail.com','spamtroll.net','speed.1s.fr','supergreatmail.com',
  'supermailer.jp','superrito.com','superstachel.de','suremail.info','teewars.org','teleworm.com',
  'teleworm.us','thanksnospam.info','thankyou2010.com','thc.st','thelimestones.com','thisisnotmyrealemail.com',
  'throwawayemailaddress.com','tilien.com','toiea.com','toomail.biz','topranklist.de','tradermail.info',
  'tuvmail.com','uggsrock.com','umail.net','uroid.com','veryrealemail.com','viditag.com','wegwerfadresse.de',
  'wegwerf-emails.de','wegwerfemail.com','wetrainbayarea.com','wh4f.org','whyspam.me','wickmail.net',
  'wilemail.com','willhackforfood.biz','willselfdestruct.com','winemaven.info','wronghead.com','wuzupmail.net',
  'xagloo.com','xemaps.com','xents.com','xmaily.com','xoxy.net','yep.it','yogamaven.com','yuurok.com',
  'z1p.biz','za.com','zehnminuten.de','zehnminutenmail.de','zippymail.info','zoemail.net','zomg.info',
  // Bangladesh-visible / commonly abused ones
  'mailnesia.com','armyspy.com','cuvox.de','dayrep.com','einrot.com','fleckens.hu','gustr.com',
  'jourrapide.com','superrito.com','teleworm.us','emltmp.com','tempinbox.com','tempinbox.co.uk',
]);

const SUSPICIOUS_LOCAL = /^(test|test\d*|abc|abcd|xyz|asdf|qwerty|demo|fake|dummy|sample|noreply|no-reply|admin|user|user\d+|foo|bar|baz|aaa|bbb|ccc|123|1234|12345|null|undefined|anonymous|anon|na|nan|none|nothing)$/i;

/**
 * Validate an email string.
 * @param {string} email
 * @returns {{ok:true} | {ok:false, code:'invalid'|'disposable'|'suspicious', message:string}}
 */
function validateEmail(email) {
  const raw = String(email || '').trim().toLowerCase();
  if (!raw) return { ok: false, code: 'invalid', message: 'ইমেইল প্রদান করুন।' };

  const m = raw.match(/^([^\s@]+)@([^\s@]+\.[^\s@]+)$/);
  if (!m) return { ok: false, code: 'invalid', message: 'সঠিক ইমেইল প্রদান করুন।' };

  const local = m[1];
  const domain = m[2];

  if (DISPOSABLE_DOMAINS.has(domain)) {
    return { ok: false, code: 'disposable', message: 'অস্থায়ী/টেম্প ইমেইল গ্রহণযোগ্য নয়। দয়া করে আপনার প্রকৃত ইমেইল ব্যবহার করুন।' };
  }

  if (SUSPICIOUS_LOCAL.test(local)) {
    return { ok: false, code: 'suspicious', message: 'দয়া করে আপনার প্রকৃত ইমেইল ঠিকানা প্রদান করুন।' };
  }

  return { ok: true };
}

module.exports = { validateEmail, DISPOSABLE_DOMAINS };
