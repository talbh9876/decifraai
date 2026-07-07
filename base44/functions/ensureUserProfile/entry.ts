import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const SAFE_PROFILE_FIELDS = ['name'];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const notify = Boolean(body?.notify);
    const requestedProfile = body?.profile && typeof body.profile === 'object' ? body.profile : {};

    const safeProfilePatch = {};
    if (typeof requestedProfile.name === 'string') {
      const trimmedName = requestedProfile.name.trim();
      if (trimmedName) safeProfilePatch.name = trimmedName;
    }

    const authId = user.id || user.user_id;
    const email = user.email || user.user?.email || user.profile?.email || '';
    const fallbackName = user.full_name || (email ? email.split('@')[0] : 'User');

    const Users = base44.asServiceRole.entities.Users;
    const found = await Users.filter({ authId }).catch(() => []);
    let dbUser = found?.[0] || null;
    let created = false;

    if (!dbUser) {
      dbUser = await Users.create({
        authId,
        email,
        name: safeProfilePatch.name || fallbackName,
        role: 'user',
        plan: 'free',
        scansUsed: 0,
      });
      created = true;

      if (notify) {
        const adminEmail = Deno.env.get('ADMIN_NOTIFY_EMAIL');
        if (adminEmail) {
          const subject = 'New user created in Decifra.ai';
          const bodyHtml = `
            <h2>New User</h2>
            <p><b>Name:</b> ${dbUser.name}</p>
            <p><b>Email:</b> ${email}</p>
            <p><b>Auth ID:</b> ${authId}</p>
            <p><b>Plan:</b> free</p>
            <p>Created at: ${new Date().toISOString()}</p>
          `;
          await base44.asServiceRole.integrations.Core.SendEmail({
            to: adminEmail,
            subject,
            body: bodyHtml,
            from_name: 'Decifra.ai',
          }).catch(() => {});
        }
      }
    } else {
      const patch = {};
      if (!dbUser.email && email) patch.email = email;
      if (!dbUser.name && fallbackName) patch.name = fallbackName;
      if (!dbUser.plan) patch.plan = 'free';
      if (safeProfilePatch.name && safeProfilePatch.name !== dbUser.name) patch.name = safeProfilePatch.name;
      if (Object.keys(patch).length) {
        dbUser = await Users.update(dbUser.id, patch);
      }
    }

    return Response.json({ user: dbUser, created, safe_profile_fields: SAFE_PROFILE_FIELDS });
  } catch (error) {
    return Response.json({ error: error?.message || 'Internal error' }, { status: 500 });
  }
});