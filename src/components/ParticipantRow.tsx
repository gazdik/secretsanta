import { Gear, X } from "@phosphor-icons/react";
import { Participant } from '../types';
import { useTranslation } from 'react-i18next';

interface ParticipantRowProps {
  participant: Participant;
  participantIndex: number;
  isLast: boolean;
  onNameChange: (name: string) => void;
  onEmailChange: (email: string) => void;
  onOpenRules: () => void;
  onRemove: () => void;
}

export function ParticipantRow({
  participant,
  participantIndex,
  isLast,
  onNameChange,
  onEmailChange,
  onOpenRules,
  onRemove,
}: ParticipantRowProps) {
  const { t } = useTranslation();

  return (
    <div className="flex gap-2">
      <input
        type="text"
        value={participant.name}
        onChange={(e) => onNameChange(e.target.value)}
        className="input-90s flex-1 min-w-0"
        placeholder={t('participants.enterName')}
        tabIndex={participantIndex * 2 + 1}
        autoFocus={isLast && document.activeElement?.tagName !== 'INPUT' && window.innerWidth >= 768}
      />

      <input
        type="email"
        value={participant.email ?? ''}
        onChange={(e) => onEmailChange(e.target.value)}
        className="input-90s flex-1 min-w-0"
        placeholder={t('participants.enterEmail')}
        tabIndex={participantIndex * 2 + 2}
      />

      {!isLast && (
        <>
          <button
            onClick={onOpenRules}
            className="button-90s flex-shrink-0"
            style={{
              background: participant.rules.length > 0 || participant.hint ? '#00FFFF' : '#C0C0C0',
              color: '#000',
              fontWeight: 'bold'
            }}
            title={participant.rules.length > 0 
              ? t('participants.rulesCount', { count: participant.rules.length })
              : t('participants.editRules')
            }
          >
            <Gear className="h-4" weight="bold" />
          </button>
          <button
            onClick={onRemove}
            className="button-90s flex-shrink-0"
            style={{ background: '#FF0000', color: '#FFFF00', fontWeight: 'bold' }}
            aria-label={t('participants.removeParticipant')}
          >
            <X className="h-4" weight="bold" />
          </button>
        </>
      )}
    </div>
  );
} 