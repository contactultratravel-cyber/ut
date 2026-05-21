import PDFDocument from 'pdfkit';
import { Response } from 'express';
import { Client } from '../../types/index';

function formatCurrency(amount: number) {
  return `${amount.toFixed(2)} DZD`;
}

function formatDate(d?: Date | string | null) {
  if (!d) return 'N/A';
  return new Date(d).toLocaleDateString('fr-DZ', {
    day: '2-digit', month: 'long', year: 'numeric',
  });
}

function header(doc: InstanceType<typeof PDFDocument>, title: string) {
  doc
    .fontSize(20)
    .fillColor('#1e3a5f')
    .text('ULTRA TRAVEL AGENCY', { align: 'center' })
    .fontSize(12)
    .fillColor('#555')
    .text('Agence de voyage — Service visa & billets', { align: 'center' })
    .moveDown(0.5)
    .moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#1e3a5f').lineWidth(2).stroke()
    .moveDown(1)
    .fontSize(16)
    .fillColor('#1e3a5f')
    .text(title, { align: 'center' })
    .moveDown(1);
}

function infoRow(doc: InstanceType<typeof PDFDocument>, label: string, value: string) {
  doc
    .fontSize(11)
    .fillColor('#333')
    .text(`${label}:`, { continued: true, width: 180 })
    .fillColor('#000')
    .text(` ${value}`);
}

export function generateInvoice(client: Client, res: Response) {
  const doc = new PDFDocument({ margin: 50, size: 'A4' });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="invoice-${client.id}.pdf"`);
  doc.pipe(res);

  header(doc, 'FACTURE / INVOICE');

  doc.fontSize(11).fillColor('#555').text(`Date: ${formatDate(new Date())}`).moveDown(0.5);
  doc.text(`Réf: INV-${client.id.slice(0, 8).toUpperCase()}`).moveDown(1);

  doc.fontSize(13).fillColor('#1e3a5f').text('Informations Client').moveDown(0.5);
  infoRow(doc, 'Nom complet', `${client.first_name} ${client.last_name}`);
  infoRow(doc, 'Téléphone', client.phone);
  if (client.email) infoRow(doc, 'Email', client.email);
  if (client.job)   infoRow(doc, 'Profession', client.job);
  doc.moveDown(1);

  doc.fontSize(13).fillColor('#1e3a5f').text('Détails de la Prestation').moveDown(0.5);
  infoRow(doc, 'Pays de destination', client.country);
  infoRow(doc, 'Type de visa', client.visa_type);
  if (client.route_code) infoRow(doc, 'Code de route', client.route_code);
  doc.moveDown(1);

  const remaining = Number(client.total_price) - Number(client.amount_paid);
  doc.fontSize(13).fillColor('#1e3a5f').text('Récapitulatif Financier').moveDown(0.5);
  infoRow(doc, 'Montant total',   formatCurrency(Number(client.total_price)));
  infoRow(doc, 'Montant payé',    formatCurrency(Number(client.amount_paid)));
  infoRow(doc, 'Reste à payer',   formatCurrency(remaining));
  doc.moveDown(2);

  doc
    .moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#ccc').lineWidth(1).stroke()
    .moveDown(1)
    .fontSize(9).fillColor('#999')
    .text('Merci de votre confiance — Ultra Travel Agency', { align: 'center' });

  doc.end();
}

export function generateContract(client: Client, res: Response) {
  const doc = new PDFDocument({ margin: 50, size: 'A4' });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="contract-${client.id}.pdf"`);
  doc.pipe(res);

  header(doc, 'CONTRAT DE PRESTATION DE SERVICE');

  doc.fontSize(11).fillColor('#333');
  doc.text(
    `Le présent contrat est conclu entre Ultra Travel Agency (ci-après "l'Agence") et ` +
    `${client.first_name} ${client.last_name} (ci-après "le Client").`
  ).moveDown(1);

  doc.fontSize(13).fillColor('#1e3a5f').text('Article 1 — Parties').moveDown(0.5);
  doc.fontSize(11).fillColor('#333');
  infoRow(doc, 'Client',     `${client.first_name} ${client.last_name}`);
  infoRow(doc, 'Téléphone',  client.phone);
  if (client.email) infoRow(doc, 'Email', client.email);
  doc.moveDown(1);

  doc.fontSize(13).fillColor('#1e3a5f').text('Article 2 — Objet').moveDown(0.5);
  doc.fontSize(11).fillColor('#333');
  doc.text(
    `L'Agence s'engage à fournir les services nécessaires pour l'obtention d'un ` +
    `${client.visa_type} pour ${client.country}.`
  ).moveDown(1);

  doc.fontSize(13).fillColor('#1e3a5f').text('Article 3 — Conditions Financières').moveDown(0.5);
  doc.fontSize(11).fillColor('#333');
  infoRow(doc, 'Montant total',  formatCurrency(Number(client.total_price)));
  infoRow(doc, 'Acompte versé',  formatCurrency(Number(client.amount_paid)));
  infoRow(doc, 'Solde restant',  formatCurrency(Number(client.total_price) - Number(client.amount_paid)));
  doc.moveDown(2);

  doc.fontSize(11).fillColor('#333').text('Fait à Alger, le ' + formatDate(new Date())).moveDown(2);

  doc
    .text('Signature Client:', { continued: true })
    .text('                              Signature Agence:', { align: 'right' });

  doc.end();
}

export function generateVoucher(client: Client, res: Response) {
  const doc = new PDFDocument({ margin: 50, size: 'A4' });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="voucher-${client.id}.pdf"`);
  doc.pipe(res);

  header(doc, 'BON DE PRISE EN CHARGE / VOUCHER');

  doc.fontSize(11).fillColor('#555');
  doc.text(`N° Dossier: VCH-${client.id.slice(0, 8).toUpperCase()}`);
  doc.text(`Date d'émission: ${formatDate(new Date())}`).moveDown(1);

  doc.fontSize(13).fillColor('#1e3a5f').text('Bénéficiaire').moveDown(0.5);
  doc.fontSize(11).fillColor('#333');
  infoRow(doc, 'Nom complet', `${client.first_name} ${client.last_name}`);
  infoRow(doc, 'Téléphone',   client.phone);
  if (client.invitation_name) infoRow(doc, 'Nom invitant', client.invitation_name);
  doc.moveDown(1);

  doc.fontSize(13).fillColor('#1e3a5f').text('Détails du Voyage').moveDown(0.5);
  doc.fontSize(11).fillColor('#333');
  infoRow(doc, 'Destination',   client.country);
  infoRow(doc, 'Type de visa',  client.visa_type);
  if (client.route_code) infoRow(doc, 'Code de route', client.route_code);
  if (client.appointment_date)
    infoRow(doc, 'Rendez-vous',  formatDate(client.appointment_date));
  doc.moveDown(2);

  doc
    .moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#1e3a5f').lineWidth(2).stroke()
    .moveDown(1)
    .fontSize(11).fillColor('#1e3a5f').text('Cachet et Signature de l\'Agence:', { align: 'right' });

  doc.end();
}
