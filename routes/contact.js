
const nodemailer = require('nodemailer');

const CONTACT_TO = process.env.CONTACT_TO || 'contact@metavagrant.com';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const RATE_WINDOW_MS = 60 * 60 * 1000;
const RATE_MAX = 5;
const hits = new Map();

const hit = function(ip) {
	const now = Date.now();
	let rec = hits.get(ip);
	if (!rec || now - rec.start > RATE_WINDOW_MS) {
		rec = { count: 0, start: now };
	}
	rec.count++;
	hits.set(ip, rec);
	return rec.count;
};

const escapeHtml = function(value) {
	return String(value)
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;');
};

const clean = function(value, max) {
	return String(value || '').trim().slice(0, max || 5000);
};

const send = async function(mail) {
	const host = process.env.SMTP_HOST;
	if (!host) {
		console.log('CONTACT EMAIL (dev, no SMTP configured) >>');
		console.log(JSON.stringify(mail, null, 2));
		return;
	}

	const transporter = nodemailer.createTransport({
		host: host,
		port: parseInt(process.env.SMTP_PORT || '465', 10),
		secure: (process.env.SMTP_SECURE || 'true') === 'true',
		auth: {
			user: process.env.SMTP_USER || '',
			pass: process.env.SMTP_PASS || ''
		}
	});

	return transporter.sendMail(mail);
};

let post = async (req, res) => {
	const body = req.body || {};
	const name = clean(body.name, 100);
	const email = clean(body.email, 200);
	const subject = clean(body.subject, 200);
	const message = clean(body.message, 5000);

	if (body.website) {
		return res.json({ ok: true });
	}

	if (!name || !email || !message) {
		return res.status(400).json({ ok: false, error: 'invalid' });
	}

	if (!EMAIL_RE.test(email)) {
		return res.status(400).json({ ok: false, error: 'invalid_email' });
	}

	if (hit(req.ip) > RATE_MAX) {
		return res.status(429).json({ ok: false, error: 'rate_limit' });
	}

	const mail = {
		from: process.env.CONTACT_FROM || `"MetaVagrant Contact" <${CONTACT_TO}>`,
		to: CONTACT_TO,
		replyTo: email,
		subject: `[metavagrant.com] ${subject || 'Contact'}`,
		text: `Name: ${name}\nEmail: ${email}\nSubject: ${subject || '-'}\n\n${message}`,
		html: `<p><b>Name:</b> ${escapeHtml(name)}</p>
<p><b>Email:</b> ${escapeHtml(email)}</p>
<p><b>Subject:</b> ${escapeHtml(subject || '-')}</p>
<hr />
<p>${escapeHtml(message).replace(/\n/g, '<br />')}</p>`
	};

	try {
		await send(mail);
		return res.json({ ok: true });
	} catch (err) {
		console.log('CONTACT EMAIL ERROR >>', err);
		return res.status(500).json({ ok: false, error: 'send_failed' });
	}
};

module.exports = { post: post, CONTACT_TO: CONTACT_TO };
