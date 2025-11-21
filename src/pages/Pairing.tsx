import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { decryptText } from '../utils/crypto';
import { PostCard } from '../components/PostCard';
import { Trans, useTranslation } from 'react-i18next';
import { MenuItem, SideMenu } from '../components/SideMenu';
import { PageTransition } from '../components/PageTransition';
import { ArrowLeft, Info } from '@phosphor-icons/react';
import { motion } from 'framer-motion';
import CryptoJS from 'crypto-js';
import { Layout } from "../components/Layout";
import { ReceiverData } from "../types";
import giftIcon from '../../static/gift-90s.svg';
import { recordLinkVisit } from '../services/linkTracking';

async function loadPairing(searchParams: URLSearchParams): Promise<[string, ReceiverData]> {
  // Legacy pairings, not generated anymore; remove after 2025-01-01
  if (searchParams.has(`name`) && searchParams.has(`key`) && searchParams.has(`pairing`)) {
    const name = searchParams.get(`name`)!;
    const key = searchParams.get(`key`)!;
    const pairing = searchParams.get(`pairing`)!;

    return [name, {name: CryptoJS.AES.decrypt(pairing, key).toString(CryptoJS.enc.Utf8)}];
  }

  if (searchParams.has(`to`)) {
    const from = searchParams.get('from')!;
    const to = searchParams.get('to')!;
    const decrypted = await decryptText(to);

    try {
      // Try to parse as JSON first (new format with hint)
      const data = JSON.parse(decrypted) as ReceiverData;
      return [from, data];
    } catch {
      // If parsing fails, it's the old format (just the name)
      return [from, {name: decrypted, hint: undefined} as ReceiverData];
    }
  }

  throw new Error(`Missing key or to parameter in search params`);
}

export function Pairing() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [assignment, setAssignment] = useState<[string, ReceiverData] | null>(null);
  const [instructions, setInstructions] = useState<string | null>(null);
  const [cardRevealed, setCardRevealed] = useState(false);

  useEffect(() => {
    const decryptReceiver = async () => {
      try {
        setAssignment(await loadPairing(searchParams));
        setInstructions(searchParams.get('info'));
      } catch (err) {
        console.error('Decryption error:', err);
        setError(t('pairing.error'));
      } finally {
        setLoading(false);
      }
    };

    decryptReceiver();
  }, [searchParams, t]);

  useEffect(() => {
    if (!assignment) {
      return;
    }

    const sessionId = searchParams.get('sid');
    const linkId = searchParams.get('lid');
    const token = searchParams.get('token')?.trim();

    if (!sessionId || !linkId || !token) {
      return;
    }

    recordLinkVisit(token, {
      sessionId,
      linkId,
      giverName: assignment[0],
      receiverName: assignment[1].name,
    }).then(() => {
      console.info('Link visit recorded');
    }).catch(err => {
      console.error('Failed to record link visit', err);
    });
  }, [assignment, searchParams]);

  useEffect(() => {
    if (assignment && !loading && !cardRevealed) {
      const timer = setTimeout(() => {
        setCardRevealed(true);
      }, 2000); // 2 second delay before revealing the card
      
      return () => clearTimeout(timer);
    }
  }, [assignment, loading, cardRevealed]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="content-box-90s max-w-md">
          <div style={{ background: '#FF0000', color: '#FFFF00', padding: '8px 16px', fontWeight: 'bold', borderBottom: '3px solid #000', fontFamily: 'Arial, Helvetica, sans-serif' }}>
            ⚠️ ERROR
          </div>
          <div style={{ padding: '16px' }}>
            <div className="text-lg font-bold">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  const menuItems: React.ReactNode[] = [];

  return (
    <Layout menuItems={menuItems}>
      <div className="flex items-center justify-center w-full">
        {!loading && assignment && (
          <>
            {!cardRevealed ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="text-center"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="mb-8"
                  style={{ display: 'flex', justifyContent: 'center' }}
                >
                  <img src={giftIcon} alt="Gift" style={{ height: '120px', width: '120px' }} />
                </motion.div>
                <div className="text-2xl font-bold mb-4" style={{ color: '#000', fontFamily: 'Arial, Helvetica, sans-serif' }}>Revealing your Secret Santa...</div>
                <div className="w-64 h-4 mx-auto overflow-hidden" style={{ border: '2px inset #999', background: 'white' }}>
                  <motion.div
                    className="h-full"
                    style={{ background: '#00FF00' }}
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 2, ease: "easeInOut" }}
                  />
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ rotateZ: -360 * 1, scale: 0 }}
                animate={{ rotateZ: 0, scale: 1, opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ ease: `easeIn`, duration: .6 }}
              >
                <PostCard>
                  <h1 className="heading-90s text-3xl mb-6 text-center">
                    {t('pairing.title')}
                  </h1>
                  <div className="hr-90s" />
                  <p className="mb-6 text-center font-bold" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
                    <Trans
                      i18nKey="pairing.assignment"
                      components={{
                        name: <span className="font-bold" style={{ color: '#0000FF' }}>{assignment![0]}</span>
                      }}
                    />
                  </p>
                  <div className="text-6xl sm:text-8xl font-bold text-center p-6" style={{ color: '#FF0000', textShadow: '3px 3px 0 #000000', fontFamily: '"Comic Sans MS", "Comic Sans", cursive' }}>
                    {assignment[1].name}
                  </div>
                  {(instructions || assignment[1].hint) && (
                    <div className="mt-6">
                      <div className="sidebar-90s">
                        <div className="flex">
                          <div className="mr-4">
                            <Info size={24}/>
                          </div>
                          <div className="space-y-2 text-sm leading-6 whitespace-pre-wrap">
                            {assignment[1].hint && <p><strong>Hint:</strong> {assignment[1].hint}</p>}
                            {instructions && <p>{instructions}</p>}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </PostCard>
              </motion.div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
