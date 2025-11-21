import { encryptText } from "./crypto";
import { ReceiverData } from "../types";

export type AssignmentLinkOptions = {
  giver: string;
  receiver: string;
  receiverHint?: string;
  instructions?: string;
  sessionId?: string;
  linkId?: string;
  token?: string;
};

export async function generateAssignmentLink(options: AssignmentLinkOptions) {
  const baseUrl = `${window.location.origin}${window.location.pathname.replace(/\/[^/]*$/, '')}`;
  const {
    giver,
    receiver,
    receiverHint,
    instructions,
    sessionId,
    linkId,
    token,
  } = options;
  
  // If there's a hint, encrypt a JSON object
  const dataToEncrypt = receiverHint
    ? JSON.stringify({ name: receiver, hint: receiverHint } as ReceiverData)
    : receiver;
    
  const encryptedReceiver = await encryptText(dataToEncrypt);
  const params = new URLSearchParams({
    from: giver,
    to: encryptedReceiver,
  });
  
  if (instructions?.trim()) {
    params.set('info', instructions.trim());
  }

  if (sessionId) {
    params.set('sid', sessionId);
  }

  if (linkId) {
    params.set('lid', linkId);
  }

  const trimmedToken = token?.trim();
  if (trimmedToken) {
    params.set('token', trimmedToken);
  }

  return `${baseUrl}/pairing?${params.toString()}`;
}

export function generateCSV(assignments: [string, string | undefined, string][]) {
  const csvContent = assignments
    .map(([giver, email, link]) => `${giver},${email ?? ''},${link}`)
    .join('\n');
  return `Giver,Email,Link\n${csvContent}`;
}