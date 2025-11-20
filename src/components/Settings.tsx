import { useTranslation } from 'react-i18next';

interface SettingsProps {
  instructions: string;
  onChangeInstructions: (instructions: string) => void;
}

export function Settings({ instructions, onChangeInstructions }: SettingsProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <div className="content-box-90s">
        <div style={{ padding: '12px' }}>
        <div className="mb-2">
          <h4 className="block text-sm font-bold" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
            {t('settings.instructions')}
          </h4>
          <p className="mt-1 text-xs" style={{ color: '#666', fontFamily: 'Arial, Helvetica, sans-serif' }}>
            {t('settings.instructionsHelp')}
          </p>
        </div>
        <textarea
          value={instructions}
          onChange={(e) => onChangeInstructions(e.target.value)}
          className="input-90s w-full min-h-[100px]"
          style={{ fontFamily: 'monospace', fontSize: '12px' }}
          placeholder={t('settings.instructionsPlaceholder')}
        />
        </div>
      </div>
    </div>
  );
} 