import { prisma } from '../config/database';
import { minioClient, BUCKETS, getPublicUrl } from '../config/minio';
import { logger } from '../utils/logger';
import React from 'react';
import ReactPDF, { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', fontSize: 10, lineHeight: 1.5 },
  header: { marginBottom: 20, textAlign: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 5 },
  tagline: { fontSize: 10, color: '#666' },
  section: { marginBottom: 15 },
  invoiceInfo: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  clientShipInfo: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  label: { fontWeight: 'bold', marginBottom: 2 },
  table: { marginTop: 10, borderWidth: 1, borderColor: '#eee' },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#eee', padding: 5 },
  tableHeader: { backgroundColor: '#f9f9f9', fontWeight: 'bold' },
  col1: { width: '40%' },
  col2: { width: '20%', textAlign: 'center' },
  col3: { width: '20%', textAlign: 'center' },
  col4: { width: '20%', textAlign: 'right' },
  totals: { marginTop: 20, alignItems: 'flex-end' },
  totalRow: { flexDirection: 'row', marginBottom: 5 },
  totalLabel: { width: 100, textAlign: 'right', paddingRight: 10 },
  totalValue: { width: 80, textAlign: 'right', fontWeight: 'bold' },
  footer: { marginTop: 40, textAlign: 'center', color: '#999', fontSize: 9 },
});

const InvoiceDoc = ({ order, invoiceNumber }: { order: any; invoiceNumber: string }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>SENIFO</Text>
        <Text style={styles.tagline}>Premium T-Shirt Printing Solutions</Text>
      </View>

      <View style={styles.invoiceInfo}>
        <View>
          <Text style={styles.label}>Invoice To:</Text>
          <Text>{order.client.name}</Text>
          <Text>{order.client.phone}</Text>
          <Text>{order.client.company || 'Individual'}</Text>
          <Text>{order.client.address || ''}</Text>
        </View>
        <View style={{ textAlign: 'right' }}>
          <Text style={styles.label}>Invoice #{invoiceNumber}</Text>
          <Text>Date: {new Date().toLocaleDateString()}</Text>
          <Text>Delivery: {order.expectedDelivery ? new Date(order.expectedDelivery).toLocaleDateString() : 'TBD'}</Text>
        </View>
      </View>

      <View style={styles.table}>
        <View style={[styles.tableRow, styles.tableHeader]}>
          <Text style={styles.col1}>Service / Description</Text>
          <Text style={styles.col2}>Qty</Text>
          <Text style={styles.col3}>Unit Price</Text>
          <Text style={styles.col4}>Total</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.col1}>
            {order.service.name} ({order.tshirtType}){"\n"}
            Sizes: {Object.entries(order.sizes).map(([s, q]) => `${s}:${q}`).join(', ')}
          </Text>
          <Text style={styles.col2}>{order.quantity}</Text>
          <Text style={styles.col3}>{Number(order.unitPrice).toFixed(2)}</Text>
          <Text style={styles.col4}>{(order.quantity * Number(order.unitPrice)).toFixed(2)}</Text>
        </View>
      </View>

      <View style={styles.totals}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Subtotal:</Text>
          <Text style={styles.totalValue}>{(order.quantity * Number(order.unitPrice)).toFixed(2)}</Text>
        </View>
        {Number(order.discountAmount) > 0 && (
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Discount:</Text>
            <Text style={styles.totalValue}>-{Number(order.discountAmount).toFixed(2)}</Text>
          </View>
        )}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Grand Total:</Text>
          <Text style={styles.totalValue}>LKR {Number(order.totalAmount).toFixed(2)}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Payment Terms:</Text>
        <Text>Full payment required before delivery.</Text>
      </View>

      <Text style={styles.footer}>Thank you for your business!</Text>
    </Page>
  </Document>
);

export class InvoiceService {
  async generate(orderId: string): Promise<string> {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { client: true, service: true },
    });

    if (!order) throw new Error('Order not found');

    const year = new Date().getFullYear();
    const countResult = await prisma.order.count({
      where: { invoiceNumber: { startsWith: `INV-${year}` } },
    });
    const invoiceNumber = `INV-${year}-${String(countResult + 1).padStart(4, '0')}`;

    const stream = await ReactPDF.renderToStream(<InvoiceDoc order={order} invoiceNumber={invoiceNumber} />);
    
    // Collect stream to buffer
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(Buffer.from(chunk));
    }
    const pdfBuffer = Buffer.concat(chunks);

    const objectKey = `invoices/${orderId}/${invoiceNumber}.pdf`;
    
    await minioClient.putObject(BUCKETS.INVOICES, objectKey, pdfBuffer, pdfBuffer.length, {
      'Content-Type': 'application/pdf',
    });

    const invoiceUrl = getPublicUrl(BUCKETS.INVOICES, objectKey);

    await prisma.order.update({
      where: { id: orderId },
      data: { invoiceUrl, invoiceNumber },
    });

    return invoiceUrl;
  }
}

export const invoiceService = new InvoiceService();
