import { Participant, Rule } from '../types';
import { checkRules } from './generatePairs';

export interface ParseSuccess {
  ok: true;
  participants: Record<string, Participant>;
}

export interface ParseError {
  ok: false;
  line: number;
  key: string;
  values?: Record<string, string>;
}

export type ParseResult = ParseSuccess | ParseError;

export function formatParticipantText(participants: Record<string, Participant>): string {
  return Object.values(participants).map(participant => {
    const rules = participant.rules
      .map(rule => {
        const targetName = participants[rule.targetParticipantId]?.name;
        if (!targetName) {
          return null;
        }

        return `${rule.type === 'must' ? '=' : '!'}${targetName}`;
      })
      .filter((rule): rule is string => !!rule)
      .join('; ');

    const columns = [
      participant.name,
      participant.email ?? '',
      rules,
    ];

    return `${columns.join(',')}\n`;
  }).join('');
}

export function parseParticipantsText(input: string, existingParticipants?: Record<string, Participant>): ParseResult {
  const lines = input.split('\n');
  const result: Record<string, Participant> = {};
  const nameToId: Record<string, string> = {};
  const existingByName = existingParticipants
    ? Object.values(existingParticipants).reduce<Record<string, Participant>>((acc, participant) => {
        acc[participant.name] = participant;
        return acc;
      }, {})
    : undefined;

  const parsedLines: {
    line: number,
    name: string,
    email?: string,
    ruleTokens: string[],
  }[] = [];

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmedLine = rawLine.trim();
    if (trimmedLine === '') continue;

    const columns = rawLine.split(',').map(part => part.trim());
    const [namePart = '', emailPart = '', ...rest] = columns;
    const rulesPart = rest.join(',').trim();

    if (!namePart) {
      return { ok: false, line: i + 1, key: 'errors.emptyName' };
    }

    const ruleTokens = rulesPart
      ? rulesPart.split(';').map(token => token.trim()).filter(Boolean)
      : [];

    parsedLines.push({
      line: i + 1,
      name: namePart,
      email: emailPart || undefined,
      ruleTokens,
    });
  }

  // First pass: create participants and build name-to-id mapping
  for (const { line, name, email } of parsedLines) {
    if (nameToId[name]) {
      return {
        ok: false,
        line,
        key: 'errors.duplicateName',
        values: { name }
      };
    }

    const existing = existingByName?.[name];
    const id = existing?.id ?? crypto.randomUUID();
    nameToId[name] = id;
    result[id] = {
      id,
      name,
      email: email ?? existing?.email,
      hint: existing?.hint,
      rules: [],
    };
  }

  // Second pass: process rules
  for (const { line, name, ruleTokens } of parsedLines) {
    const id = nameToId[name];
    const rules: Rule[] = [];

    for (const token of ruleTokens) {
      const match = /^([=!])(.+)$/.exec(token);
      if (!match) {
        return {
          ok: false,
          line,
          key: 'errors.invalidRuleFormat',
          values: { rule: token },
        };
      }

      const [, operator, targetNameRaw] = match;
      const targetName = targetNameRaw.trim();
      if (!targetName) {
        return {
          ok: false,
          line,
          key: 'errors.invalidRuleFormat',
          values: { rule: token },
        };
      }

      const targetId = nameToId[targetName];
      if (!targetId) {
        return {
          ok: false,
          line,
          key: 'errors.unknownParticipant',
          values: { name: targetName },
        };
      }

      rules.push({
        type: operator === '=' ? 'must' : 'mustNot',
        targetParticipantId: targetId,
      });
    }

    const validationError = checkRules(rules);
    if (validationError) {
      return {
        ok: false,
        line,
        key: validationError,
      };
    }

    result[id].rules = rules;
  }

  return { ok: true, participants: result };
}
 
