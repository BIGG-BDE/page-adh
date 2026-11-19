import os

# Le modèle de page avec le footer et les liens absolus
template = """<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Fiche Adhérent - BIGG BDE</title>
    <link rel="stylesheet" href="/style.css">
    <script src="/data.js"></script>
    
    <meta name="theme-color" content="#9b2226">
    <link rel="icon" type="image/png" href="https://biggbde.fr/assets/favicons/favicon-192x192.png" sizes="192x192">
    <link rel="icon" type="image/svg+xml" href="https://biggbde.fr/assets/favicons/favicon.svg">
    <link rel="apple-touch-icon" sizes="180x180" href="https://biggbde.fr/assets/favicons/apple-touch-icon.png" />
    <meta name="apple-mobile-web-app-title" content="BIGG BDE" />
    <link rel="manifest" href="https://biggbde.fr/assets/favicons/site.webmanifest" />
    
    <meta name="twitter:card" content="summary">
    <meta name="twitter:title" content="BIGG BDE">
    <meta name="twitter:site" content="@https://adh.biggbde.fr">
    <meta name="twitter:description" content="La liste des adhérent.e.s du BIGG BDE sur le mandat 2026-2027 !">
    <meta name="twitter:image" content="https://biggbde.fr/assets/favicons/web-app-manifest-512x512.png">
    <meta name="twitter:image:alt" content="Logo BIGG BDE">

    <meta property="og:type" content="website">
    <meta property="og:title" content="BIGG BDE - Accueil">
    <meta property="og:url" content="https://adh.biggbde.fr/">
    <meta property="og:image" content="https://biggbde.fr/assets/favicons/web-app-manifest-512x512.png">
    <meta property="og:description" content="La liste des adhérent.e.s du BIGG BDE sur le mandat 2026-2027 !">
</head>
<body>
    <header>
        <a href="/" class="brand">
            <img src="https://biggbde.fr/assets/favicons/web-app-manifest-512x512.png" alt="Logo BIGG BDE">
            <h1>BIGG BDE</h1>
        </a>
    </header>
    
    <main id="member-app"></main>
    
    <footer>
        <div class="footer-links">
            <a href="/mentions-legales/">Mentions Légales</a>
            <a href="/2026-2027/ADH_BIGG_26-27.xlsx" download>Fichier ADH</a>
        </div>
        <div class="footer-socials">
            <span><a href="https://www.instagram.com/bigg_bde" target="_blank">Instagram</a></span>
            <span><a href="https://www.facebook.com/profile.php?id=61569855328651" target="_blank">Facebook</a></span>
            <span><a href="https://www.tiktok.com/@biggbde" target="_blank">Tiktok</a></span>
        </div>
        
        <button id="scrollTopBtn" onclick="window.scrollTo({top: 0, behavior: 'smooth'})" title="Remonter en haut">
            <img src="https://biggbde.fr/assets/svg/angle-up-svgrepo-com.svg" alt="Angled Up Arrow SVG ; AUTHOR: FortAwesome" class="scroll-icon">
        </button>
    </footer>
    
    <script src="/member.js"></script>
</body>
</html>"""

# Liste complète des identifiants
liste_ids = [
    "p2603210", "p2600309", "p2505626", "p2601080", "luca-vincent", "p2601685", 
    "p2618127", "p2500120", "p2503853", "p2602003", "p2502280", "p2502774", 
    "p2400293", "p2603847", "p2512556", "p2500133", "p2607480", "p2407065", 
    "p2303542", "p2405392", "p2505323", "p2606759", "p2402984", "p2601070", 
    "p2607508", "p2601376", "p2605396", "p2601696", "p2402285", "p2611161", 
    "p2606636", "p2608330", "p2618026", "p2601879", "p2605846", "p2506978", 
    "p2502768", "p2613430", "p2608144", "p2410543", "p2606078", "p2600491", 
    "p2607838", "p2405590", "p2601395", "p2605371", "p2500928", "p2604515", 
    "syebel-larios-liocourt", "p2501142", "p2404108", "p2400326", "p2608476", 
    "p2500855", "p2408173", "p2501490", "p2408341", "p2402577", "p2503598", 
    "p2500474", "p2604396", "p2614033", "p2501344", "p2505195"
]

# Création du dossier principal
main_dir = "2026-2027"
os.makedirs(main_dir, exist_ok=True)

# Création des sous-dossiers pour chaque étudiant
for folder_name in liste_ids:
    folder_path = os.path.join(main_dir, folder_name)
    os.makedirs(folder_path, exist_ok=True)
    
    with open(os.path.join(folder_path, "index.html"), "w", encoding="utf-8") as f:
        f.write(template)

print(f"Les {len(liste_ids)} dossiers ont ete generes dans le dossier {main_dir} avec succes !")