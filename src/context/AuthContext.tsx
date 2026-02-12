import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  selectedPlan: string | null;
  signup: (email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  savePlan: (planType: string) => Promise<void>;
  checkUserPlan: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  useEffect(() => {
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/2595f84f-cbd5-495e-a29e-39870c95961e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.tsx:42',message:'Auth state change listener mounted',data:{},timestamp:Date.now(),hypothesisId:'H1'})}).catch(()=>{});
    // #endregion
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/2595f84f-cbd5-495e-a29e-39870c95961e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.tsx:43',message:'Auth state changed',data:{hasUser:!!user,userId:user?.uid,userEmail:user?.email},timestamp:Date.now(),hypothesisId:'H1,H3'})}).catch(()=>{});
      // #endregion
      
      setUser(user);
      let plan: string | null = null;
      
      if (user) {
        // #region agent log
        fetch('http://127.0.0.1:7244/ingest/2595f84f-cbd5-495e-a29e-39870c95961e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.tsx:47',message:'Calling checkUserPlan',data:{userId:user.uid},timestamp:Date.now(),hypothesisId:'H1,H2'})}).catch(()=>{});
        // #endregion
        
        // Load user's plan when they login
        plan = await checkUserPlan();
        
        // #region agent log
        fetch('http://127.0.0.1:7244/ingest/2595f84f-cbd5-495e-a29e-39870c95961e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.tsx:48',message:'checkUserPlan completed',data:{plan:plan},timestamp:Date.now(),hypothesisId:'H1,H2'})}).catch(()=>{});
        // #endregion
        
        setSelectedPlan(plan);
      } else {
        setSelectedPlan(null);
      }
      
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/2595f84f-cbd5-495e-a29e-39870c95961e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.tsx:53',message:'Setting loading to false',data:{hasUser:!!user,plan:plan},timestamp:Date.now(),hypothesisId:'H3'})}).catch(()=>{});
      // #endregion
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signup = async (email: string, password: string) => {
    await createUserWithEmailAndPassword(auth, email, password);
  };

  const login = async (email: string, password: string) => {
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/2595f84f-cbd5-495e-a29e-39870c95961e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.tsx:63',message:'login called',data:{email:email},timestamp:Date.now(),hypothesisId:'H6',runId:'fix2'})}).catch(()=>{});
    // #endregion
    await signInWithEmailAndPassword(auth, email, password);
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/2595f84f-cbd5-495e-a29e-39870c95961e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.tsx:64',message:'login completed',data:{email:email},timestamp:Date.now(),hypothesisId:'H6',runId:'fix2'})}).catch(()=>{});
    // #endregion
  };

  const logout = async () => {
    await signOut(auth);
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    // Request access to user's profile and email
    provider.addScope('profile');
    provider.addScope('email');
    const result = await signInWithPopup(auth, provider);
    
    // Debug: Log the user data after sign-in
    console.log('Google sign-in result:', {
      email: result.user.email,
      photoURL: result.user.photoURL,
      displayName: result.user.displayName,
      providerId: result.user.providerId,
    });
  };

  const savePlan = async (planType: string) => {
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/2595f84f-cbd5-495e-a29e-39870c95961e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.tsx:79',message:'savePlan called',data:{planType:planType,hasUser:!!user,userId:user?.uid},timestamp:Date.now(),hypothesisId:'H4',runId:'fix1'})}).catch(()=>{});
    // #endregion
    
    if (!user) {
      throw new Error('User must be authenticated to save plan');
    }

    try {
      // Add timeout to prevent hanging when offline (same as checkUserPlan)
      const timeoutPromise = new Promise<boolean>((_, reject) => {
        setTimeout(() => reject(new Error('Firestore write timeout after 5 seconds')), 5000);
      });

      // Save plan to Firestore
      const userDocRef = doc(db, 'users', user.uid);
      
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/2595f84f-cbd5-495e-a29e-39870c95961e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.tsx:87',message:'Calling setDoc',data:{userId:user.uid,planType:planType},timestamp:Date.now(),hypothesisId:'H4',runId:'fix1'})}).catch(()=>{});
      // #endregion
      
      const writePromise = setDoc(userDocRef, {
        email: user.email,
        plan: planType,
        planSelectedAt: new Date().toISOString(),
      }, { merge: true });

      // Race between write and timeout
      await Promise.race([writePromise, timeoutPromise]);

      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/2595f84f-cbd5-495e-a29e-39870c95961e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.tsx:93',message:'setDoc completed - setting state',data:{planType:planType},timestamp:Date.now(),hypothesisId:'H4',runId:'fix1'})}).catch(()=>{});
      // #endregion

      setSelectedPlan(planType);
      
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/2595f84f-cbd5-495e-a29e-39870c95961e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.tsx:94',message:'savePlan completed successfully',data:{planType:planType},timestamp:Date.now(),hypothesisId:'H4',runId:'fix1'})}).catch(()=>{});
      // #endregion
    } catch (error) {
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/2595f84f-cbd5-495e-a29e-39870c95961e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.tsx:95',message:'savePlan error or timeout',data:{error:error instanceof Error?error.message:String(error)},timestamp:Date.now(),hypothesisId:'H4',runId:'fix1'})}).catch(()=>{});
      // #endregion
      console.error('Error saving plan:', error);
      
      // Still set the plan locally even if Firestore write fails/times out
      // This allows the user to continue using the app offline
      setSelectedPlan(planType);
      
      // Don't throw - allow user to proceed with cached plan
      console.warn('Plan saved locally but not persisted to Firestore');
    }
  };

  const checkUserPlan = async (): Promise<string | null> => {
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/2595f84f-cbd5-495e-a29e-39870c95961e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.tsx:100',message:'checkUserPlan called',data:{hasCurrentUser:!!auth.currentUser},timestamp:Date.now(),hypothesisId:'H1,H2,H5'})}).catch(()=>{});
    // #endregion
    
    if (!auth.currentUser) {
      return null;
    }

    try {
      // Add timeout to prevent hanging when offline
      const timeoutPromise = new Promise<null>((resolve) => {
        // #region agent log
        fetch('http://127.0.0.1:7244/ingest/2595f84f-cbd5-495e-a29e-39870c95961e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.tsx:108',message:'Timeout set for 5s',data:{},timestamp:Date.now(),hypothesisId:'H1'})}).catch(()=>{});
        // #endregion
        setTimeout(() => {
          // #region agent log
          fetch('http://127.0.0.1:7244/ingest/2595f84f-cbd5-495e-a29e-39870c95961e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.tsx:109',message:'Timeout triggered - returning null',data:{},timestamp:Date.now(),hypothesisId:'H1'})}).catch(()=>{});
          // #endregion
          resolve(null);
        }, 5000);
      });

      const userDocRef = doc(db, 'users', auth.currentUser.uid);
      
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/2595f84f-cbd5-495e-a29e-39870c95961e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.tsx:112',message:'Starting getDoc',data:{userId:auth.currentUser.uid},timestamp:Date.now(),hypothesisId:'H2,H5'})}).catch(()=>{});
      // #endregion
      
      const fetchPromise = getDoc(userDocRef);

      // Race between fetch and timeout
      const userDoc = await Promise.race([fetchPromise, timeoutPromise]);

      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/2595f84f-cbd5-495e-a29e-39870c95961e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.tsx:115',message:'Promise.race resolved',data:{hasUserDoc:!!userDoc,exists:userDoc?.exists?.()},timestamp:Date.now(),hypothesisId:'H1,H2,H5'})}).catch(()=>{});
      // #endregion

      if (userDoc && userDoc.exists()) {
        const data = userDoc.data();
        // #region agent log
        fetch('http://127.0.0.1:7244/ingest/2595f84f-cbd5-495e-a29e-39870c95961e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.tsx:119',message:'User doc exists - returning plan',data:{plan:data.plan},timestamp:Date.now(),hypothesisId:'H5'})}).catch(()=>{});
        // #endregion
        return data.plan || null;
      }

      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/2595f84f-cbd5-495e-a29e-39870c95961e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.tsx:122',message:'No user doc found - returning null',data:{},timestamp:Date.now(),hypothesisId:'H5'})}).catch(()=>{});
      // #endregion

      return null;
    } catch (error) {
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/2595f84f-cbd5-495e-a29e-39870c95961e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.tsx:124',message:'checkUserPlan error caught',data:{error:error instanceof Error?error.message:String(error)},timestamp:Date.now(),hypothesisId:'H2'})}).catch(()=>{});
      // #endregion
      console.error('Error checking user plan:', error);
      return null;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    selectedPlan,
    signup,
    login,
    logout,
    signInWithGoogle,
    savePlan,
    checkUserPlan,
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};
