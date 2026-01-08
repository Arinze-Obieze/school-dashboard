import { adminDb, adminAuth } from '@/firebaseAdmin';

const db = adminDb;
const auth = adminAuth;

/**
 * Checks if a user has superadmin role
 * @param {string} uid - Firebase user UID
 * @returns {Promise<boolean>}
 */
export async function isSuperAdmin(uid) {
  try {
    const user = await auth.getUser(uid);
    return user.customClaims?.role === 'superadmin';
  } catch (error) {
    console.error(`Error checking superadmin status for ${uid}:`, error.message);
    return false;
  }
}

/**
 * Logs admin action to audit collection
 * @param {Object} action - Action details
 */
export async function logAdminAction(action) {
  try {
    const {
      adminUid,
      adminEmail,
      actionType,
      targetUid,
      targetEmail,
      details,
      status,
      timestamp = new Date().toISOString(),
    } = action;

    await db.collection('admin-audit-logs').add({
      adminUid,
      adminEmail,
      actionType, // 'promote-superadmin', 'revoke-superadmin', etc.
      targetUid,
      targetEmail,
      details,
      status, // 'success', 'failure', 'pending'
      timestamp,
      ipAddress: action.ipAddress || 'unknown',
    });

    console.log(`[AUDIT] Admin action: ${actionType} by ${adminEmail} on ${targetEmail}`);
  } catch (error) {
    console.error('[AUDIT] Failed to log admin action:', error.message);
    // Don't throw - logging failure shouldn't break the operation
  }
}

/**
 * Gets pending admin promotion requests (for approval workflow)
 * @returns {Promise<Array>}
 */
export async function getPendingPromotionRequests() {
  try {
    const snapshot = await db
      .collection('admin-audit-logs')
      .where('actionType', '==', 'promote-superadmin')
      .where('status', '==', 'pending')
      .orderBy('timestamp', 'desc')
      .get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error fetching pending promotion requests:', error.message);
    return [];
  }
}

/**
 * Approves a pending promotion request
 * @param {string} requestId - ID of the audit log entry
 * @param {string} approverUid - UID of the admin approving
 * @param {string} targetUid - UID of user to promote
 */
export async function approveSuperAdminPromotion(requestId, approverUid, targetUid) {
  try {
    const targetUser = await auth.getUser(targetUid);
    const approverUser = await auth.getUser(approverUid);

    // Set custom claims
    await auth.setCustomUserClaims(targetUid, { role: 'superadmin' });

    // Update audit log
    await db.collection('admin-audit-logs').doc(requestId).update({
      status: 'approved',
      approvedBy: approverUid,
      approvedByEmail: approverUser.email,
      approvedAt: new Date().toISOString(),
    });

    // Log the approval
    await logAdminAction({
      adminUid: approverUid,
      adminEmail: approverUser.email,
      actionType: 'approve-superadmin-promotion',
      targetUid,
      targetEmail: targetUser.email,
      details: `Approved superadmin promotion for ${targetUser.email}`,
      status: 'success',
    });

    return {
      success: true,
      message: `${targetUser.email} promoted to superadmin`,
    };
  } catch (error) {
    console.error('Error approving promotion:', error.message);
    throw error;
  }
}

/**
 * Revokes superadmin role from a user
 * @param {string} uid - UID of user to revoke from
 * @param {string} revokerUid - UID of admin revoking
 */
export async function revokeSuperAdminRole(uid, revokerUid) {
  try {
    const targetUser = await auth.getUser(uid);
    const revokerUser = await auth.getUser(revokerUid);

    // Remove custom claims
    await auth.setCustomUserClaims(uid, null);

    // Log the action
    await logAdminAction({
      adminUid: revokerUid,
      adminEmail: revokerUser.email,
      actionType: 'revoke-superadmin',
      targetUid: uid,
      targetEmail: targetUser.email,
      details: `Revoked superadmin role from ${targetUser.email}`,
      status: 'success',
    });

    return {
      success: true,
      message: `Superadmin role revoked from ${targetUser.email}`,
    };
  } catch (error) {
    console.error('Error revoking superadmin role:', error.message);
    throw error;
  }
}

/**
 * Gets all superadmins
 * @returns {Promise<Array>} List of superadmin users
 */
export async function getAllSuperAdmins() {
  try {
    const listUsersResult = await auth.listUsers(1000); // Max 1000 per page
    const superAdmins = listUsersResult.users.filter(
      (user) => user.customClaims?.role === 'superadmin'
    );

    return superAdmins.map((user) => ({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      createdAt: user.metadata.creationTime,
    }));
  } catch (error) {
    console.error('Error fetching superadmins:', error.message);
    return [];
  }
}
