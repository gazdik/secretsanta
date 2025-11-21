import React, { useEffect, useMemo } from "react";
import { DownloadSimple } from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";
import { CopyButton } from "./CopyButton";
import { AssignmentLinkOptions, generateAssignmentLink, generateCSV } from "../utils/links";
import { Participant } from "../types";
import { GeneratedPairs, generateGenerationHash } from "../utils/generatePairs";
import { registerSessionLinks } from "../services/linkTracking";

interface SecretSantaLinksProps {
  assignments: GeneratedPairs;
  instructions?: string;
  participants: Record<string, Participant>;
  dbToken?: string;
  onGeneratePairs: () => void;
}

export function SecretSantaLinks({ assignments, instructions, participants, dbToken, onGeneratePairs }: SecretSantaLinksProps) {
  const { t } = useTranslation();
  const trimmedToken = dbToken?.trim() ?? '';

  const currentHash = generateGenerationHash(participants);
  const hasChanged = currentHash !== assignments.hash;

  const sharingEntries = useMemo(() => {
    return assignments.pairings.map(({ giver, receiver, linkId }) => {
      const giverParticipant = participants[giver.id];
      const receiverParticipant = participants[receiver.id];

      return {
        linkId,
        giverName: giverParticipant?.name ?? giver.name,
        giverEmail: giverParticipant?.email,
        receiverName: receiverParticipant?.name ?? receiver.name,
        receiverHint: receiverParticipant?.hint,
      };
    }).sort((a, b) => a.giverName.localeCompare(b.giverName));
  }, [assignments.pairings, participants]);

  const linkOptions = useMemo<AssignmentLinkOptions[]>(() => {
    return sharingEntries.map(entry => ({
      giver: entry.giverName,
      receiver: entry.receiverName,
      receiverHint: entry.receiverHint,
      instructions,
      sessionId: assignments.sessionId,
      linkId: entry.linkId,
      token: trimmedToken || undefined,
    }));
  }, [sharingEntries, instructions, assignments.sessionId, trimmedToken]);

  useEffect(() => {
    if (!trimmedToken || linkOptions.length === 0) {
      return;
    }

    registerSessionLinks(trimmedToken, linkOptions.map(option => ({
      sessionId: option.sessionId!,
      linkId: option.linkId!,
      giverName: option.giver,
      receiverName: option.receiver,
    }))).catch(err => {
      console.error('Failed to register session links', err);
    });
  }, [trimmedToken, linkOptions]);

  const adminUrl = useMemo(() => {
    if (!trimmedToken) {
      return null;
    }

    if (typeof window === 'undefined') {
      return null;
    }

    const baseUrl = `${window.location.origin}${window.location.pathname.replace(/\/[^/]*$/, '')}`;
    const params = new URLSearchParams({
      sid: assignments.sessionId,
      token: trimmedToken,
    });

    return `${baseUrl}/admin?${params.toString()}`;
  }, [assignments.sessionId, trimmedToken]);

  const handleExportCSV = async () => {
    const linksData = await Promise.all(
      linkOptions.map(async (options, index) => {
        const link = await generateAssignmentLink(options);
        const { giverName, giverEmail } = sharingEntries[index];
        return [giverName, giverEmail, link] as [string, string | undefined, string];
      })
    );

    const csvContent = generateCSV(linksData);
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'secret-santa-links.csv';
    a.click();

    window.URL.revokeObjectURL(url);
  };

  return <>
    {hasChanged && (
      <div className="sidebar-90s mb-4">
        <p className="text-sm font-bold mb-2">
          ⚠️ {t('links.warningParticipantsChanged')}
        </p>
        <button
          className="button-90s w-full"
          style={{ background: '#FF00FF', color: '#FFFF00', fontWeight: 'bold' }}
          onClick={onGeneratePairs}
        >
          {t('links.resetAssignments')}
        </button>
      </div>
    )}
    <div className="content-box-90s">
      <div style={{ padding: '12px' }}>
      <div className="flex flex-wrap gap-4 items-center mb-4">
        <p className="text-sm flex-1 min-w-[200px]">
          {t('links.shareInstructions')}
        </p>
        <button
          onClick={handleExportCSV}
          className="button-90s flex flex-none items-center gap-2"
          style={{ background: '#00FF00', color: '#000', fontWeight: 'bold' }}
        >
          <DownloadSimple size={20} weight="bold" />
          {t('links.exportCSV')}
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-[minmax(100px,auto)_1fr] gap-3">
        {linkOptions.map((options, index) => (
          <React.Fragment key={options.linkId ?? `${options.giver}-${options.receiver}`}>
            <span className="font-bold self-center">
              {options.giver}:
            </span>
            <CopyButton
              textToCopy={() => generateAssignmentLink(options)}
              className="button-90s flex items-center justify-center gap-2"
              style={{ background: '#0000FF', color: '#FFFF00', fontWeight: 'bold' }}
            >
              {t('links.copySecretLink')}
            </CopyButton>
          </React.Fragment>
        ))}
      </div>
      <div className="mt-6">
        <p className="text-xs mb-2" style={{ color: '#333', fontFamily: 'Arial, Helvetica, sans-serif' }}>
          {t('links.adminHelp')}
        </p>
        <button
          className="button-90s w-full"
          style={{ background: '#FFA500', color: '#000', fontWeight: 'bold', opacity: adminUrl ? 1 : 0.6 }}
          onClick={() => adminUrl && window.open(adminUrl, '_blank', 'noopener')}
          disabled={!adminUrl}
        >
          {t('links.adminCta')}
        </button>
      </div>
      </div>
    </div>
  </>;
}