import { useState, useEffect } from "react";
import { X, Plus, Link, LinkBreak } from "@phosphor-icons/react";
import { Participant, Rule } from '../types';
import { useTranslation } from 'react-i18next';
import { produce } from "immer";

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  participantId: string;
  participants: Record<string, Participant>;
  onChangeParticipants: (newParticipants: Record<string, Participant>) => void;
}

export function RulesModal({
  isOpen,
  onClose,
  participantId,
  participants,
  onChangeParticipants,
}: RulesModalProps) {
  const { t } = useTranslation();
  const participant = participants[participantId];
  const [localRules, setLocalRules] = useState<Rule[]>(participant.rules);
  const [localHint, setLocalHint] = useState<string>(participant.hint || '');

  // Add escape key handler
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => {
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isOpen, onClose]);

  const addRule = (type: 'must' | 'mustNot') => {
    setLocalRules([...localRules, { type, targetParticipantId: '' }]);
  };

  const updateRule = (index: number, targetParticipantId: string) => {
    const newRules = [...localRules];
    newRules[index].targetParticipantId = targetParticipantId;
    setLocalRules(newRules);
  };

  const removeRule = (index: number) => {
    setLocalRules(localRules.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    onChangeParticipants(produce(participants, draft => {
      draft[participantId].rules = localRules;
      draft[participantId].hint = localHint || undefined;
    }));
    onClose();
  };

  const hasMustRule = localRules.some(rule => rule.type === 'must');
  const hasMustNotRule = localRules.some(rule => rule.type === 'mustNot');

  if (!isOpen)
      return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="content-box-90s max-w-xl w-full">
        <div style={{ background: '#008080', color: '#FFFF00', padding: '8px 16px', fontWeight: 'bold', borderBottom: '3px solid #000', fontFamily: 'Arial, Helvetica, sans-serif' }}>
          {t('rules.title', { name: participant.name })}
        </div>
        <div style={{ padding: '16px' }}>
        <h2 className="sr-only">
          {t('rules.title', { name: participant.name })}
        </h2>
        
        <div className="mb-6">
          <label className="block text-sm font-bold mb-2">
            {t('rules.hintLabel')}
          </label>
          <input
            type="text"
            value={localHint}
            onChange={(e) => setLocalHint(e.target.value)}
            placeholder={t('rules.hintPlaceholder')}
            className="input-90s w-full"
          />
        </div>
        
        <div className="space-y-4 mb-6">
          {localRules.map((rule, index) => (
            <div key={index} className="flex gap-2 items-center flex-wrap">
              <span className="font-bold text-sm">
                {rule.type === 'must' 
                  ? t('rules.mustBePairedWith')
                  : t('rules.mustNotBePairedWith')
                }
              </span>
              <select
                value={rule.targetParticipantId}
                onChange={(e) => updateRule(index, e.target.value)}
                className="input-90s flex-1 min-w-[150px]"
              >
                <option value="">{t('rules.selectParticipant')}</option>
                {Object.values(participants)
                  .filter(p => p.id !== participantId)
                  .map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))
                }
              </select>
              <button
                onClick={() => removeRule(index)}
                className="button-90s"
                style={{ background: '#FF0000', color: '#FFFF00', fontWeight: 'bold' }}
                aria-label={t('rules.removeRule')}
              >
                <X size={20} weight="bold" />
              </button>
            </div>
          ))}
        </div>

        <div className="flex gap-2 mb-6 flex-wrap">
          <button
            onClick={() => addRule('must')}
            disabled={hasMustNotRule}
            className="button-90s flex-1 min-w-[150px] flex items-center justify-center gap-2"
            style={{
              background: hasMustNotRule ? '#999' : '#0000FF',
              color: '#FFFF00',
              fontWeight: 'bold',
              cursor: hasMustNotRule ? 'not-allowed' : 'pointer'
            }}
          >
            <Link size={20} />
            {t('rules.addMustRule')}
          </button>
          <button
            onClick={() => addRule('mustNot')}
            disabled={hasMustRule}
            className="button-90s flex-1 min-w-[150px] flex items-center justify-center gap-2"
            style={{
              background: hasMustRule ? '#999' : '#FF0000',
              color: '#FFFF00',
              fontWeight: 'bold',
              cursor: hasMustRule ? 'not-allowed' : 'pointer'
            }}
          >
            <LinkBreak size={20} />
            {t('rules.addMustNotRule')}
          </button>
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="button-90s"
          >
            {t('rules.cancel')}
          </button>
          <button
            onClick={handleSave}
            className="button-90s"
            style={{ background: '#00FF00', color: '#000', fontWeight: 'bold' }}
          >
            {t('rules.saveRules')}
          </button>
        </div>
        </div>
      </div>
    </div>
  );
} 