import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  QueryConstraint,
  DocumentData,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from '../firebase/config';

interface UseFirestoreOptions {
  realtime?: boolean;
}

export function useFirestore<T = DocumentData>(
  collectionName: string,
  options: UseFirestoreOptions = {}
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Get all documents
  const getAll = useCallback(
    async (constraints: QueryConstraint[] = []) => {
      setLoading(true);
      setError(null);
      try {
        const q = query(collection(db, collectionName), ...constraints);
        const querySnapshot = await getDocs(q);
        const docs = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as T[];
        setData(docs);
        return docs;
      } catch (err: any) {
        setError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [collectionName]
  );

  // Get single document
  const getById = useCallback(
    async (id: string) => {
      setLoading(true);
      setError(null);
      try {
        const docRef = doc(db, collectionName, id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          return { id: docSnap.id, ...docSnap.data() } as T;
        }
        return null;
      } catch (err: any) {
        setError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [collectionName]
  );

  // Create document
  const create = useCallback(
    async (data: Partial<T>) => {
      setLoading(true);
      setError(null);
      try {
        // #region agent log
        fetch('http://127.0.0.1:7244/ingest/2595f84f-cbd5-495e-a29e-39870c95961e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useFirestore.ts:85',message:'addDoc called',data:{collection:collectionName},timestamp:Date.now(),hypothesisId:'H2',runId:'onboard1'})}).catch(()=>{});
        // #endregion
        
        // Add timeout to prevent indefinite hanging
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Firestore write timeout after 10 seconds')), 10000);
        });
        
        const writePromise = addDoc(collection(db, collectionName), data as any);
        const docRef = await Promise.race([writePromise, timeoutPromise]);
        
        // #region agent log
        fetch('http://127.0.0.1:7244/ingest/2595f84f-cbd5-495e-a29e-39870c95961e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useFirestore.ts:86',message:'addDoc completed',data:{docId:docRef.id},timestamp:Date.now(),hypothesisId:'H2',runId:'onboard1'})}).catch(()=>{});
        // #endregion
        
        return docRef.id;
      } catch (err: any) {
        // #region agent log
        fetch('http://127.0.0.1:7244/ingest/2595f84f-cbd5-495e-a29e-39870c95961e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useFirestore.ts:88',message:'addDoc error',data:{error:err?.message||String(err)},timestamp:Date.now(),hypothesisId:'H3',runId:'onboard1'})}).catch(()=>{});
        // #endregion
        setError(err);
        console.warn('Firestore write may have failed, but operation may still succeed in background');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [collectionName]
  );

  // Update document
  const update = useCallback(
    async (id: string, data: Partial<T>) => {
      setLoading(true);
      setError(null);
      try {
        const docRef = doc(db, collectionName, id);
        
        // Add timeout to prevent indefinite hanging
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Firestore update timeout after 10 seconds')), 10000);
        });
        
        const updatePromise = updateDoc(docRef, data as any);
        await Promise.race([updatePromise, timeoutPromise]);
      } catch (err: any) {
        setError(err);
        console.warn('Firestore update may have failed, but operation may still succeed in background');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [collectionName]
  );

  // Delete document
  const remove = useCallback(
    async (id: string) => {
      setLoading(true);
      setError(null);
      try {
        const docRef = doc(db, collectionName, id);
        await deleteDoc(docRef);
      } catch (err: any) {
        setError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [collectionName]
  );

  // Real-time subscription
  useEffect(() => {
    if (!options.realtime) return;

    let unsubscribe: Unsubscribe | undefined;

    const setupRealtime = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, collectionName));
        unsubscribe = onSnapshot(
          q,
          (snapshot) => {
            const docs = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            })) as T[];
            setData(docs);
            setLoading(false);
          },
          (err) => {
            setError(err);
            setLoading(false);
          }
        );
      } catch (err: any) {
        setError(err);
        setLoading(false);
      }
    };

    setupRealtime();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [collectionName, options.realtime]);

  return {
    data,
    loading,
    error,
    getAll,
    getById,
    create,
    update,
    remove,
  };
}
