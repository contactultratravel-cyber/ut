import nodemailer from 'nodemailer';

export async function sendRegistrationCode(opts: {
  toAdmin: string;
  employeeName: string;
  employeeEmail: string;
  role: string;
  code: string;
}) {
  const roleLabel = opts.role === 'ACCOUNTANT' ? 'Comptable' : 'Employé';
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER ?? 'contact.ultratravel@gmail.com',
        pass: (process.env.GMAIL_PASS ?? '').replace(/\s/g, ''),
      },
    });
    await transporter.sendMail({
      from: `"Ultra Travel" <${process.env.GMAIL_USER}>`,
      to: opts.toAdmin,
      subject: `Nouvelle inscription Ultra Travel — ${opts.employeeName}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;padding:24px;border:1px solid #e5e7eb;border-radius:12px;">
          <h2 style="color:#1e3a5f;margin-top:0;">Ultra Travel — Nouvelle inscription</h2>
          <p>Un nouvel employé s'est inscrit et attend d'être activé :</p>
          <table style="width:100%;border-collapse:collapse;margin:16px 0;">
            <tr><td style="padding:8px;color:#6b7280;width:140px;">Nom</td><td style="padding:8px;font-weight:600;">${opts.employeeName}</td></tr>
            <tr style="background:#f9fafb;"><td style="padding:8px;color:#6b7280;">Email</td><td style="padding:8px;font-weight:600;">${opts.employeeEmail}</td></tr>
            <tr><td style="padding:8px;color:#6b7280;">Rôle</td><td style="padding:8px;font-weight:600;">${roleLabel}</td></tr>
          </table>
          <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:20px;text-align:center;margin:20px 0;">
            <p style="margin:0 0 8px;color:#6b7280;font-size:13px;">CODE DE VÉRIFICATION</p>
            <p style="margin:0;font-size:36px;font-weight:800;color:#1d4ed8;letter-spacing:8px;">${opts.code}</p>
          </div>
          <p style="color:#6b7280;font-size:13px;">Donnez ce code à l'employé pour qu'il active son compte. Ce code est à usage unique.</p>
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;">
          <p style="color:#9ca3af;font-size:12px;margin:0;">Ultra Travel · Système de gestion interne</p>
        </div>
      `,
    });
  } catch (err) {
    console.error('[Email] Erreur envoi:', err);
  }
}
