import { Pinecone } from '@pinecone-database/pinecone';

import { env } from './env.js';

let cachedClient = null;
let cachedIndex = null;

export const isPineconeConfigured = () =>
  Boolean(env.PINECONE_API_KEY) && Boolean(env.PINECONE_INDEX);

export const getPineconeClient = () => {
  if (!isPineconeConfigured()) {
    throw new Error(
      'Pinecone is not configured. Set PINECONE_API_KEY and PINECONE_INDEX in the environment.',
    );
  }
  cachedClient ??= new Pinecone({ apiKey: env.PINECONE_API_KEY });
  return cachedClient;
};

export const getPineconeIndex = () => {
  cachedIndex ??= getPineconeClient().index(env.PINECONE_INDEX);
  return cachedIndex;
};
