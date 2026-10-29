import { supabase } from '../lib/supabase';

export interface CreateReportParams {
  reporterId: string;
  sightingId?: string | null;
  reportedUserId?: string | null;
  reason: string;
}

export const ReportRepository = {
  async create(params: CreateReportParams): Promise<void> {
    const trimmedReason = params.reason.trim();
    if (!trimmedReason) {
      throw new Error('Selecciona o describe un motivo para el reporte.');
    }

    const { error } = await supabase.from('reports').insert({
      user_id: params.reporterId,
      sighting_id: params.sightingId ?? null,
      reported_user_id: params.reportedUserId ?? null,
      reason: trimmedReason,
    });

    if (error) {
      throw error;
    }
  },
};

