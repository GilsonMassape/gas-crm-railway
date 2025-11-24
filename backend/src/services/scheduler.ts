import { Pool } from 'pg';
import dayjs from 'dayjs';

const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'crm_postgres',
  user: process.env.POSTGRES_USER || 'crm',
  password: process.env.POSTGRES_PASSWORD || 'crm',
  database: process.env.POSTGRES_DB || 'crm',
});

export async function generateReminderQueue() {
  console.log('[Scheduler] Verificando lembretes...');
  const client = await pool.connect();

  try {
    const result = await client.query(`
      INSERT INTO message_queue (customer_id, template_id, channel, payload, scheduled_for, status)
      SELECT 
        c.id AS customer_id,
        r.template_id,
        'whatsapp' AS channel,
        json_build_object('firstName', split_part(c.full_name, ' ', 1), 'days', r.after_days) AS payload,
        now() + interval '5 minutes' AS scheduled_for,
        'pending' AS status
      FROM customers c
      JOIN purchases p ON p.customer_id = c.id
      JOIN reminder_rules r ON r.product = p.product
      WHERE r.active = TRUE
      AND now() - p.purchased_at >= (r.after_days * interval '1 day')
      AND NOT EXISTS (
        SELECT 1 FROM message_queue mq
        WHERE mq.customer_id = c.id
        AND mq.template_id = r.template_id
        AND mq.status IN ('pending', 'sent')
      )
      RETURNING *;
    `);

    console.log(`[Scheduler] ${result.rowCount} lembretes adicionados à fila.`);
  } catch (error) {
    console.error('[Scheduler] Erro ao gerar fila:', error);
  } finally {
    client.release();
  }
}

if (require.main === module) {
  generateReminderQueue().then(() => process.exit(0));
}
