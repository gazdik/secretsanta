import { useState } from 'react';
import { ArrowsClockwise, List, TextT } from "@phosphor-icons/react";
import { Participant } from '../types';
import { useTranslation } from 'react-i18next';
import { ParticipantRow } from './ParticipantRow';
import { ParticipantsTextView } from './ParticipantsTextView';
import { produce } from 'immer';

interface ParticipantsListProps {
  participants: Record<string, Participant>;
  onChangeParticipants: (newParticipants: Record<string, Participant>) => void;
  onOpenRules: (participantName: string) => void;
  onGeneratePairs: () => void;
}

export function ParticipantsList({
  participants,
  onChangeParticipants,
  onOpenRules,
  onGeneratePairs,
}: ParticipantsListProps) {
  const { t } = useTranslation();
  const [nextParticipantId, setNextParticipantId] = useState(() => crypto.randomUUID());

  const updateParticipant = (id: string, name: string) => {
    if (id === nextParticipantId) {
      setNextParticipantId(crypto.randomUUID());
    }
      
    onChangeParticipants(produce(participants, draft => {
      draft[id] ??= {id, name, rules: []};
      draft[id].name = name;
    }));
  };

  const updateParticipantEmail = (id: string, email: string) => {
    if (id === nextParticipantId) {
      setNextParticipantId(crypto.randomUUID());
    }

    onChangeParticipants(produce(participants, draft => {
      draft[id] ??= {id, name: '', rules: []};
      draft[id].email = email || undefined;
    }));
  };

  const removeParticipant = (id: string) => {
    onChangeParticipants(produce(participants, draft => {
      delete draft[id];

      for (const participant of Object.values(draft)) {
        participant.rules = participant.rules.filter(rule => 
          rule.targetParticipantId !== id
        );
      }
    }));
  };

  const participantsList = [...Object.values(participants), { 
    id: nextParticipantId, 
    name: '', 
    email: '',
    rules: [] 
  }];

  return (
    <div className="space-y-4">
      <p className="mt-1 text-xs" style={{ color: '#666' }}>
        {t('participants.generationWarning')}
      </p>

      <div className="space-y-2">
        {participantsList.map((participant, index) => (
          <ParticipantRow
            key={participant.id}
            participant={participant}
            participantIndex={index}
            isLast={index === Object.keys(participants).length}
            onNameChange={(name) => updateParticipant(participant.id, name)}
            onEmailChange={(email) => updateParticipantEmail(participant.id, email)}
            onOpenRules={() => onOpenRules(participant.id)}
            onRemove={() => removeParticipant(participant.id)}
          />
        ))}
      </div>

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