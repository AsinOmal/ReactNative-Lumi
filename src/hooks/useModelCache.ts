// 📖 What this does:
// React wrapper around modelCacheStore. Loads the top 5 hot models on mount
// and exposes recordView() to be called whenever a model is shown in AR.
//
// hotModels is used by the AR Word Find game to seed its word pool with models
// the child already recognises — improving engagement and reducing confusion.
//
// Watch out: recordView is async but fire-and-forget in the calling component.
// The caller does not need to await it — cache updates happen in the background.

import { useState, useEffect, useCallback } from 'react';
import { recordModelView, getHotModels } from '../utils/modelCacheStore';

const HOT_MODEL_COUNT = 5;

export const useModelCache = () => {
  const [hotModels, setHotModels] = useState<string[]>([]);

  useEffect(() => {
    getHotModels(HOT_MODEL_COUNT)
      .then(setHotModels)
      .catch(() => {});
  }, []);

  const recordView = useCallback((word: string) => {
    recordModelView(word)
      .then(() => getHotModels(HOT_MODEL_COUNT))
      .then(setHotModels)
      .catch(() => {});
  }, []);

  return { hotModels, recordView };
};
