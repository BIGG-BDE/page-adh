const SUPABASE_URL = 'https://qchyaljicwhdeouajlbx.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_jGHf8OHZ1Pla-oYU_dtGHQ_nMC5ecty';

const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const menuToggle = document.getElementById('menu-toggle');
const mainNav = document.getElementById('main-nav');
const authSection = document.getElementById('auth-section');
const profileSection = document.getElementById('profile-section');
const voteSection = document.getElementById('vote-section');
const authForm = document.getElementById('auth-form');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const signupBtn = document.getElementById('signup-btn');
const authMessage = document.getElementById('auth-message');
const navAuth = document.getElementById('nav-auth');
const userEmailSpan = document.getElementById('user-email');
const logoutBtn = document.getElementById('logout-btn');
const memberName = document.getElementById('member-name');
const qrcodeContainer = document.getElementById('qrcode-container');
const pollQuestion = document.getElementById('poll-question');
const pollOptions = document.getElementById('poll-options');
const voteMessage = document.getElementById('vote-message');
const resultsContainer = document.getElementById('results-container');
const resultsList = document.getElementById('results-list');

let currentUser = null;
let currentMember = null;
let currentPoll = null;
let realtimeChannel = null;

menuToggle.addEventListener('click', () => {
    mainNav.classList.toggle('nav-open');
});

function showMessage(el, text, type = '') {
    el.textContent = text;
    el.className = 'message' + (type ? ' ' + type : '');
}

async function init() {
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (session) {
        currentUser = session.user;
        await onAuthenticated();
    } else {
        showAuth();
    }

    supabaseClient.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
            currentUser = session.user;
            await onAuthenticated();
        } else if (event === 'SIGNED_OUT') {
            currentUser = null;
            showAuth();
        }
    });
}

function showAuth() {
    authSection.classList.remove('hidden');
    profileSection.classList.add('hidden');
    voteSection.classList.add('hidden');
    navAuth.classList.add('hidden');
    if (realtimeChannel) {
        supabaseClient.removeChannel(realtimeChannel);
        realtimeChannel = null;
    }
}

async function onAuthenticated() {
    // 1. Récupérer les infos de la table members
    const { data: member, error } = await supabaseClient
        .from('members')
        .select('*')
        .ilike('email', currentUser.email) // <-- On utilise ilike au lieu de eq
        .maybeSingle(); // <-- On utilise maybeSingle pour éviter les erreurs si 0 ligne

        if (error || !member) {
        const debugMsg = error ? error.message : "Aucune ligne trouvée dans la table members pour cet email.";
        showMessage(authMessage, "Erreur technique : " + debugMsg, 'error');
        await supabaseClient.auth.signOut();
        return;
    }

    currentMember = member;

    authSection.classList.add('hidden');
    profileSection.classList.remove('hidden');
    voteSection.classList.remove('hidden');
    navAuth.classList.remove('hidden');
    userEmailSpan.textContent = currentUser.email;

    memberName.textContent = `${member.first_name} ${member.last_name}`;
    
    const cardDetails = document.createElement('p');
    cardDetails.className = 'member-details';
    cardDetails.textContent = `${member.filiere} - ${member.annee}`;
    
    if (!document.querySelector('.member-details')) {
        memberName.parentNode.insertBefore(cardDetails, memberName.nextSibling);
    }

    qrcodeContainer.innerHTML = '';
    const qrUrl = `https://adh.biggbde.fr/verify.html?id=${currentUser.id}`;
    
    new QRCode(qrcodeContainer, {
        text: qrUrl,
        width: 200,
        height: 200,
        colorDark: '#2b2d42',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.H
    });

    await loadActivePoll();
}

async function loadActivePoll() {
    // ... (Le code des sondages reste exactement le même qu'avant)
    const { data: polls, error } = await supabaseClient
        .from('polls')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1);

    if (error || !polls || polls.length === 0) {
        pollQuestion.textContent = 'Aucun vote en cours.';
        pollOptions.innerHTML = '';
        resultsContainer.classList.add('hidden');
        return;
    }

    currentPoll = polls[0];
    pollQuestion.textContent = currentPoll.question;

    const { data: options } = await supabaseClient
        .from('poll_options')
        .select('*')
        .eq('poll_id', currentPoll.id)
        .order('id', { ascending: true });

    const { data: existingVote } = await supabaseClient
        .from('votes')
        .select('id')
        .eq('poll_id', currentPoll.id)
        .eq('user_id', currentUser.id)
        .maybeSingle();

    pollOptions.innerHTML = '';
    options.forEach((opt) => {
        const label = document.createElement('label');
        label.className = 'poll-option';
        if (existingVote) label.style.pointerEvents = 'none';

        const input = document.createElement('input');
        input.type = 'radio';
        input.name = 'poll-option';
        input.value = opt.id;
        if (existingVote) input.disabled = true;

        const span = document.createElement('span');
        span.textContent = opt.option_text;

        label.appendChild(input);
        label.appendChild(span);
        label.addEventListener('click', () => {
            if (!existingVote) {
                document.querySelectorAll('.poll-option').forEach(l => l.classList.remove('selected'));
                label.classList.add('selected');
                input.checked = true;
            }
        });

        pollOptions.appendChild(label);
    });

    if (!existingVote) {
        const submitBtn = document.createElement('button');
        submitBtn.className = 'btn';
        submitBtn.textContent = 'Voter';
        submitBtn.style.marginTop = '1rem';
        submitBtn.addEventListener('click', async () => {
            const selected = document.querySelector('input[name="poll-option"]:checked');
            if (!selected) {
                showMessage(voteMessage, 'Sélectionne une option avant de voter.', 'error');
                return;
            }

            const optionId = parseInt(selected.value, 10);
            if (isNaN(optionId)) return;

            submitBtn.disabled = true;
            submitBtn.textContent = 'Envoi...';

            const { error: insertError } = await supabaseClient
                .from('votes')
                .insert({
                    poll_id: currentPoll.id,
                    option_id: optionId,
                    user_id: currentUser.id
                });

            if (insertError) {
                showMessage(voteMessage, 'Une erreur est survenue lors du vote.', 'error');
                submitBtn.disabled = false;
                submitBtn.textContent = 'Voter';
                return;
            }

            showMessage(voteMessage, 'Vote enregistré avec succès.', 'success');
            document.querySelectorAll('.poll-option').forEach(l => l.style.pointerEvents = 'none');
            document.querySelectorAll('input[name="poll-option"]').forEach(i => i.disabled = true);
            submitBtn.remove();
        });
        pollOptions.appendChild(submitBtn);
    } else {
        showMessage(voteMessage, 'Tu as déjà voté pour ce scrutin.', 'success');
    }

    await displayResults(currentPoll.id, options);

    if (realtimeChannel) supabaseClient.removeChannel(realtimeChannel);
    realtimeChannel = supabaseClient
        .channel('votes-realtime')
        .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'votes',
            filter: `poll_id=eq.${currentPoll.id}`
        }, async () => {
            await displayResults(currentPoll.id, options);
        })
        .subscribe();
}

async function displayResults(pollId, options) {
    // ... (Le code des résultats reste le même)
    const { data: votes } = await supabaseClient.from('votes').select('option_id').eq('poll_id', pollId);
    const counts = {};
    options.forEach(o => counts[o.id] = 0);
    (votes || []).forEach(v => { if (counts[v.option_id] !== undefined) counts[v.option_id]++; });

    const total = (votes || []).length;
    resultsContainer.classList.remove('hidden');
    resultsList.innerHTML = '';

    options.forEach(opt => {
        const count = counts[opt.id];
        const pct = total > 0 ? Math.round((count / total) * 100) : 0;

        const row = document.createElement('div');
        row.className = 'result-row';
        const label = document.createElement('div');
        label.className = 'result-label';
        const spanText = document.createElement('span');
        spanText.textContent = opt.option_text;
        const spanCount = document.createElement('span');
        spanCount.textContent = `${count} (${pct}%)`;
        label.appendChild(spanText);
        label.appendChild(spanCount);

        const bar = document.createElement('div');
        bar.className = 'result-bar';
        const fill = document.createElement('div');
        fill.className = 'result-fill';
        fill.style.width = pct + '%';
        bar.appendChild(fill);

        row.appendChild(label);
        row.appendChild(bar);
        resultsList.appendChild(row);
    });
}

authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email || !password) {
        showMessage(authMessage, 'Veuillez remplir tous les champs.', 'error');
        return;
    }

    showMessage(authMessage, 'Connexion...');
    const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
    
    if (error) showMessage(authMessage, 'Identifiants incorrects.', 'error');
});

signupBtn.addEventListener('click', async () => {
    const email = emailInput.value.trim().toLowerCase();
    const password = passwordInput.value;

    if (!email || !password) {
        showMessage(authMessage, 'Email et mot de passe requis.', 'error');
        return;
    }

    if (password.length < 6) {
        showMessage(authMessage, 'Le mot de passe doit contenir au moins 6 caractères.', 'error');
        return;
    }

    showMessage(authMessage, 'Vérification de ton adhésion...');

    // APPEL DE LA NOUVELLE FONCTION SECURISEE
    const { data: isMember, error: memberError } = await supabaseClient
        .rpc('check_member_email', { email_to_check: email });

    if (memberError || !isMember) {
        showMessage(authMessage, "Désolé, cette adresse email n'est pas dans la liste des adhérents. Si tu as payé ton adhésion en espèces, contacte le BDE.", 'error');
        return;
    }

    // Si l'email est valide, on crée le compte
    showMessage(authMessage, 'Création du compte...');
    const { error } = await supabaseClient.auth.signUp({ email, password });

    if (error) {
        showMessage(authMessage, "Erreur lors de l'inscription : " + error.message, 'error');
    } else {
        showMessage(authMessage, 'Inscription réussie ! Vérifie ta boîte mail.', 'success');
    }
});

logoutBtn.addEventListener('click', async () => {
    await supabaseClient.auth.signOut();
});

init();