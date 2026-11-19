document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;
    const segments = path.split('/').filter(p => p && !p.includes('.html'));
    const id = segments[segments.length - 1];

    const member = members.find(m => m.id === id);
    const app = document.getElementById('member-app');

    if (!member) {
        app.innerHTML = `
            <div class="error-wrapper" style="min-height: 50vh;">
                <div class="profile-card">
                    <h2>Adhérent introuvable</h2>
                    <p style="color:var(--gray); margin-bottom:1.5rem;">Cet identifiant ne correspond à aucun membre du BIGG BDE.</p>
                    <a href="/" class="btn">Retour à l'annuaire</a>
                </div>
            </div>
        `;
        return;
    }

    app.innerHTML = `
        <div class="id-card-wrapper">
            <div class="id-card">
                <div class="id-header">
                    <div class="id-brand">
                        <img src="https://biggbde.fr/assets/favicons/web-app-manifest-512x512.png" alt="Logo">
                        <span>BIGG BDE</span>
                    </div>
                </div>

                <div class="id-body">
                    <h2 class="id-name">${member.prenom}<br>${member.nom || ''}</h2>
                    <div class="id-badge">Membre Officiel</div>
                </div>

                <div class="id-footer">
                    <div class="id-data">
                        <span class="id-label">Filière</span>
                        <span class="id-value">${member.filiere}</span>
                    </div>
                    <div class="id-data">
                        <span class="id-label">Année</span>
                        <span class="id-value">${member.annee}</span>
                    </div>
                    <div class="id-data">
                        <span class="id-label">Mandat</span>
                        <span class="id-value">2026 - 2027</span>
                    </div>
                    <div class="id-data">
                        <span class="id-label">N° Adhérent</span>
                        <span class="id-value mono">${member.displayId || member.id}</span>
                    </div>
                </div>
            </div>

            <a href="/" class="btn btn-return">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" class="btn-arrow-left">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Retour à l'annuaire
            </a>
        </div>
    `;
});