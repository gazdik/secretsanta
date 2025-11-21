import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Layout } from '../components/Layout';
import { PageTransition } from '../components/PageTransition';
import { PostCard } from '../components/PostCard';
import { fetchSessionLinks, LinkVisit } from '../services/linkTracking';

export function TrackingDashboard() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('sid')?.trim() ?? '';
  const token = searchParams.get('token')?.trim() ?? '';

  const [visits, setVisits] = useState<LinkVisit[]>([]);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [revealCounts, setRevealCounts] = useState<Record<string, number>>({});

  const canLoad = sessionId.length > 0 && token.length > 0;

  const loadData = useCallback(async () => {
    if (!canLoad) {
      return;
    }

    setStatus('loading');
    setErrorMessage(null);

    try {
      const rows = await fetchSessionLinks(token, sessionId);
      setVisits(rows);
      setStatus('idle');
    } catch (err) {
      console.error('Failed to fetch tracking data', err);
      setStatus('error');
      setErrorMessage(t('admin.error'));
    }
  }, [canLoad, sessionId, token, t]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const sortedVisits = useMemo(() => {
    return [...visits].sort((a, b) => a.giverName.localeCompare(b.giverName));
  }, [visits]);

  const menuItems: React.ReactNode[] = [];

  const content = (() => {
    if (!canLoad) {
      return (
        <div className="sidebar-90s">
          <p>{t('admin.missingParams')}</p>
        </div>
      );
    }

    if (status === 'loading') {
      return (
        <div className="sidebar-90s">
          <p>{t('admin.loading')}</p>
        </div>
      );
    }

    if (status === 'error') {
      return (
        <div className="sidebar-90s" style={{ borderColor: '#FF0000' }}>
          <p>{errorMessage}</p>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="text-left py-2 pr-4">{t('admin.table.giver')}</th>
              <th className="text-left py-2 pr-4">{t('admin.table.receiver')}</th>
              <th className="text-left py-2 pr-4">{t('admin.table.visits')}</th>
              <th className="text-left py-2">{t('admin.table.lastVisit')}</th>
            </tr>
          </thead>
          <tbody>
            {sortedVisits.map((visit: LinkVisit) => {
              const lastVisited = visit.lastVisitedAt
                ? new Date(visit.lastVisitedAt).toLocaleString()
                : t('admin.neverVisited');
              const revealCount = revealCounts[visit.linkId] ?? 0;
              const isRevealed = revealCount >= 3;
              return (
                <tr key={visit.linkId} className="border-t border-gray-200">
                  <td className="py-2 pr-4 font-bold">{visit.giverName}</td>
                  <td className="py-2 pr-4">
                    {isRevealed ? (
                      visit.receiverName
                    ) : (
                      <div className="space-y-1">
                        <button
                          className="button-90s text-xs"
                          style={{ background: '#FFD700', color: '#000', fontWeight: 'bold' }}
                          onClick={() => setRevealCounts((prev: Record<string, number>) => ({
                            ...prev,
                            [visit.linkId]: (prev[visit.linkId] ?? 0) + 1,
                          }))}
                        >
                          {t('admin.table.revealButton')}
                        </button>
                        {revealCount > 0 && (
                          <p className="text-xxs" style={{ fontSize: '10px' }}>
                            {t('admin.table.revealHint', { count: Math.min(revealCount, 3) })}
                          </p>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="py-2 pr-4">{visit.visitCount}</td>
                  <td className="py-2">{lastVisited}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  })();

  return (
    <PageTransition>
      <Layout menuItems={menuItems}>
        <div className="flex-1">
          <PostCard>
            <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
              <div>
                <h1 className="heading-90s text-2xl" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
                  {t('admin.title')}
                </h1>
                {sessionId && (
                  <p className="text-xs" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
                    {t('admin.sessionLabel')}: <strong>{sessionId}</strong>
                  </p>
                )}
              </div>
              <button
                className="button-90s"
                style={{ background: '#00FFFF', color: '#000', fontWeight: 'bold' }}
                onClick={loadData}
                disabled={!canLoad}
              >
                {t('admin.refresh')}
              </button>
            </div>
            {content}
          </PostCard>
        </div>
      </Layout>
    </PageTransition>
  );
}
