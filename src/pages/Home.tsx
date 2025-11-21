import { useState } from 'react';
import { RulesModal } from '../components/RulesModal';
import { GeneratedPairs, generatePairs } from '../utils/generatePairs';
import { Accordion } from '../components/Accordion';
import { AccordionContainer } from '../components/AccordionContainer';
import { ParticipantsList } from '../components/ParticipantsList';
import { ParticipantsTextView } from '../components/ParticipantsTextView';
import { SecretSantaLinks } from '../components/SecretSantaLinks';
import { Participant, Rule } from '../types';
import { Link } from 'react-router-dom';
import { PostCard } from '../components/PostCard';
import { Trans, useTranslation } from 'react-i18next';
import { MenuItem } from '../components/SideMenu';
import { PageTransition } from '../components/PageTransition';
import { Code, Heart, Rows, Star } from '@phosphor-icons/react';
import { Settings } from '../components/Settings';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Layout } from '../components/Layout';

function createLocalId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return Math.random().toString(36).slice(2);
}

function migrateParticipants(value: any) {
  // The first release of the new tool used an array of participants.
  if (Array.isArray(value)) {
    const migrated: Record<string, Participant> = {};
    const ids = new Map<string, string>();

    for (const participant of value) {
      const id = crypto.randomUUID();
      ids.set(participant.name, id);
    }

    for (const participant of value) {
      const id = ids.get(participant.name)!;

      migrated[id] = {
        id,
        name: participant.name,
        rules: participant.rules.map(({type, targetParticipant}: {type: string, targetParticipant: string}) => {
          const targetParticipantId = ids.get(targetParticipant);
          return targetParticipantId ? {type, targetParticipantId} : null;
        }).filter((rule: any): rule is Rule => {
          return !!rule;
        }),
      };

      console.log(migrated);
    }

    return migrated;
  }

  return value;
}

function ensureAssignmentMetadata(value: any): GeneratedPairs | null {
  if (!value) {
    return value;
  }

  const sessionId = value.sessionId ?? createLocalId();
  const pairings = Array.isArray(value.pairings)
    ? value.pairings.map((pairing: any) => ({
        linkId: pairing?.linkId ?? createLocalId(),
        giver: pairing?.giver,
        receiver: pairing?.receiver,
      }))
    : [];

  return {
    ...value,
    sessionId,
    pairings,
  };
}

function migrateAssignments(value: any) {
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return null;
    }

    return ensureAssignmentMetadata({
      hash: ``,
      pairings: value.map(([giver, receiver]) => ({
        linkId: createLocalId(),
        giver: {id: ``, name: giver},
        receiver: {id: ``, name: receiver},
      })),
    });
  }

  return ensureAssignmentMetadata(value);
}

export function Home() {
  const { t } = useTranslation();
  const [isTextView, setIsTextView] = useState(false);

  const [participants, setParticipants] = useLocalStorage<Record<string, Participant>>('secretSantaParticipants', {}, migrateParticipants);
  const [assignments, setAssignments] = useLocalStorage<GeneratedPairs | null>('secretSantaAssignments', null, migrateAssignments);
  const [instructions, setInstructions] = useLocalStorage<string>('secretSantaInstructions', '');
  const [dbToken, setDbToken] = useLocalStorage<string>('secretSantaDbToken', '');

  const [selectedParticipantId, setSelectedParticipantId] = useState<string | null>(null);
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);
  const [openSection, setOpenSection] = useState<'participants' | 'links' | 'settings'>('participants');

  const handleGeneratePairs = () => {
    const assignments = generatePairs(participants);
    if (assignments === null) {
      alert(Object.keys(participants).length < 2 
        ? t('errors.needMoreParticipants')
        : t('errors.invalidPairs')
      );
      return;
    }

    setAssignments(assignments);
    setOpenSection('links');
  };

  const menuItems: React.ReactNode[] = [];

  const toggleViewButton = (
    <button
      onClick={(e) => {
        e.stopPropagation();
        setIsTextView(!isTextView);
      }}
      className="button-90s"
      style={{ padding: '4px 8px', background: '#C0C0C0', color: '#000' }}
      title={t(isTextView ? 'participants.switchToFormView' : 'participants.switchToTextView')}
    >
      {isTextView ? <Rows size={16} weight={`bold`} /> : <Code size={16} weight={`bold`} />}
    </button>
  );

  return <>
    <PageTransition>
      <Layout menuItems={menuItems}>
        <div className="lg:flex-[6_6_0%]">
          <PostCard>
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4 flex-wrap justify-center">
                <img src="/static/christmas-tree-90s.svg" alt="Tree" style={{ height: '40px', width: '40px' }} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                <h1 className="heading-90s text-2xl sm:text-3xl" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
                  {t('home.title')}
                </h1>
                <img src="/static/santa-90s.svg" alt="Santa" style={{ height: '40px', width: '40px' }} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
              </div>
              <div className="hr-90s" />
              <div className="space-y-4 text-sm sm:text-base" style={{ color: '#000', fontFamily: 'Times New Roman, Times, serif' }}>
                <Trans
                  i18nKey="home.explanation"
                  components={{
                    p: <p/>,
                    githubLink: <a className="link-90s" href="https://github.com/gazdik/secretsanta" target="_blank"/>,
                    exampleLink: <Link className="link-90s" to="/pairing?from=Simba&to=c1w%2FUV9lXC12U578BHPYZhXxhsK0fPTqoQDU9CA7W581P%2BM%3D"/>,
                  }}
                />
              </div>
            </div>
          </PostCard>
        </div>

        <div className="lg:order-none lg:flex-[5_5_0%]">
          <AccordionContainer>
            <Accordion
              title={t('participants.title')}
              isOpen={openSection === 'participants'}
              onToggle={() => setOpenSection('participants')}
              action={toggleViewButton}
            >
              {isTextView ? (
                <ParticipantsTextView
                  participants={participants}
                  onChangeParticipants={setParticipants}
                  onGeneratePairs={handleGeneratePairs}
                />
              ) : (
                <ParticipantsList
                  participants={participants}
                  onChangeParticipants={setParticipants}
                  onOpenRules={(id) => {
                    setSelectedParticipantId(id);
                    setIsRulesModalOpen(true);
                  }}
                  onGeneratePairs={handleGeneratePairs}
                />
              )}
            </Accordion>

            <Accordion
              title={t('settings.title')}
              isOpen={openSection === 'settings'}
              onToggle={() => setOpenSection('settings')}
            >
              <Settings
                instructions={instructions}
                onChangeInstructions={setInstructions}
                dbToken={dbToken}
                onChangeDbToken={setDbToken}
              />
            </Accordion>

            {assignments && (
              <Accordion
                title={t('links.title')}
                isOpen={openSection === 'links'}
                onToggle={() => setOpenSection('links')}
              >
                <SecretSantaLinks
                  assignments={assignments}
                  instructions={instructions}
                  participants={participants}
                  dbToken={dbToken}
                  onGeneratePairs={handleGeneratePairs}
                />
              </Accordion>
            )}
          </AccordionContainer>
        </div>
      </Layout>
    </PageTransition>
    {isRulesModalOpen && selectedParticipantId && (
      <RulesModal
        isOpen={isRulesModalOpen}
        onClose={() => setIsRulesModalOpen(false)}
        participants={participants}
        participantId={selectedParticipantId}
        onChangeParticipants={setParticipants}
      />
    )}
  </>;
}