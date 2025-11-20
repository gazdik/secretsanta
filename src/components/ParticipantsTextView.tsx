import { Participant } from '../types';
import { useState } from 'react';
import { parseParticipantsText, ParseError, formatParticipantText } from '../utils/parseParticipants';
import { ArrowsClockwise } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';

interface ParticipantsTextViewProps {
  participants: Record<string, Participant>;
  onChangeParticipants: (newParticipants: Record<string, Participant>) => void;
  onGeneratePairs: () => void;
}

export function ParticipantsTextView({ participants, onChangeParticipants, onGeneratePairs }: ParticipantsTextViewProps) {
  const { t } = useTranslation();

  const [text, setText] = useState(() => formatParticipantText(participants));
  const [error, setError] = useState<ParseError | null>(null);

  const handleChange = (newText: string) => {
    setText(newText);
    
    const result = parseParticipantsText(newText, participants);
    if (result.ok) {
      setError(null);
      onChangeParticipants(result.participants);
    } else {
      setError(result);
    }
  };

  return (
    <div className="relative space-y-2">
      <textarea
        className={`input-90s block w-full h-48 font-mono text-sm text-nowrap ${
          error ? 'border-red-500' : ''
        }`}
        style={{ fontFamily: 'Courier New, monospace' }}
        value={text}
        onChange={e => handleChange(e.target.value)}
      />

      {error && (
        <div className="sidebar-90s" style={{ background: '#FFCCCC', borderColor: '#CC0000' }}>
          <strong>⚠️ Error on line {error.line}:</strong> {t(error.key as any, error.values)}
        </div>
      )}

      <button
        type="button"
        onClick={onGeneratePairs}
        className="button-90s w-full flex items-center justify-center gap-2"
        style={{ background: '#00FF00', color: '#000', fontWeight: 'bold', padding: '8px 16px' }}
      >
        <ArrowsClockwise size={20} weight="bold" />
        {t('participants.generatePairs')}
      </button>
    </div>
  );
} 