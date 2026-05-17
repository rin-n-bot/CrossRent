// services/transactionService.ts

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { db, auth } from '../firebase';

const getRentPeriod = (item: any) => {
  return (
    item.rentPeriod ||
    item.rentalPeriod ||
    item.duration ||
    item.borrowPeriod ||
    'Not specified'
  );
};

const getRentPrice = (item: any) => {
  return (
    item.rentPrice ??
    item.price ??
    item.rentalPrice ??
    item.pricePerDay ??
    item.rate ??
    null
  );
};

export const handleRentRequest = async (item: any, user: any) => {
  const transRef = await addDoc(collection(db, 'transactions'), {
    itemId: item.id,
    itemName: item.name || item.title,
    ownerId: item.ownerId,
    ownerEmail: item.ownerEmail,
    renterId: user.uid,
    renterEmail: user.email,
    status: 'requested',
    createdAt: serverTimestamp(),
    statusChangedAt: null,
    approvedAt: null,
    completedAt: null,
    cancelledAt: null,
    rentPeriod: getRentPeriod(item),
    rentPrice: getRentPrice(item),
    itemDeleted: false,
    showToOwner: true,
    showToRenter: true,
  });

  const itemRef = doc(db, 'items', item.id);
  await updateDoc(itemRef, {
    status: 'Pending',
    currentTransactionId: transRef.id,
  });

  await addDoc(collection(db, 'logs'), {
    action: 'requested',
    by: user.uid,
    role: 'renter',
    transactionId: transRef.id,
    itemId: item.id,
    itemName: item.name || item.title,
    createdAt: serverTimestamp(),
  });

  return transRef.id;
};

export const updateTransactionStatus = async (
  transactionId: string,
  itemId: string,
  newStatus: string
) => {
  const user = auth.currentUser;
  if (!user) return;

  const transRef = doc(db, 'transactions', transactionId);

  const transactionUpdates: Record<string, any> = {
    status: newStatus,
    statusChangedAt: serverTimestamp(),
  };

  if (newStatus === 'rented') {
    transactionUpdates.approvedAt = serverTimestamp();
  } else if (newStatus === 'completed') {
    transactionUpdates.completedAt = serverTimestamp();
  } else if (newStatus === 'cancelled') {
    transactionUpdates.cancelledAt = serverTimestamp();
  }

  await updateDoc(transRef, transactionUpdates);

  try {
    const itemRef = doc(db, 'items', itemId);
    if (newStatus === 'rented') {
      await updateDoc(itemRef, { status: 'Rented' });
    } else if (newStatus === 'completed' || newStatus === 'cancelled') {
      await updateDoc(itemRef, {
        status: 'Available',
        currentTransactionId: null,
      });
    }
  } catch (err: any) {
    if (err?.code !== 'not-found') {
      throw err;
    }
  }

  const role =
    newStatus === 'cancelled'
      ? 'renter'
      : newStatus === 'completed'
      ? 'owner'
      : 'owner';

  await addDoc(collection(db, 'logs'), {
    action: newStatus,
    by: user.uid,
    role,
    transactionId,
    itemId,
    createdAt: serverTimestamp(),
  });
};

export const handleItemDelete = async (itemId: string, itemName: string) => {
  const user = auth.currentUser;
  if (!user) return;

  const batch = writeBatch(db);

  const q = query(
    collection(db, 'transactions'),
    where('itemId', '==', itemId),
    where('status', 'in', ['requested', 'rented'])
  );
  const snapshot = await getDocs(q);

  snapshot.forEach((txDoc) => {
    batch.update(txDoc.ref, {
      itemDeleted: true,
      itemName: 'Deleted Item',
    });
  });

  const itemRef = doc(db, 'items', itemId);
  batch.delete(itemRef);

  await batch.commit();

  await addDoc(collection(db, 'logs'), {
    action: 'item_deleted',
    by: user.uid,
    role: 'owner',
    itemId,
    itemName,
    affectedTransactions: snapshot.docs.map((d) => d.id),
    createdAt: serverTimestamp(),
  });
};

export const deleteTransactionRecord = async (transactionId: string, itemId: string, itemName: string) => {
  const user = auth.currentUser;
  if (!user) return;

  await addDoc(collection(db, 'logs'), {
    action: 'transaction_dismissed',
    by: user.uid,
    transactionId,
    itemId,
    itemName,
    createdAt: serverTimestamp(),
  });

  await deleteDoc(doc(db, 'transactions', transactionId));
};