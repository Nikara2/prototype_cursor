/**
 * Application principale - Scanner de cartes d'assurance avec OCR
 * 
 * Fonctionnalités :
 * - Accès à la caméra
 * - Capture d'image
 * - OCR avec Tesseract.js
 * - Extraction des informations
 * - Envoi au backend
 * - Affichage des cartes enregistrées
 */

// Configuration de l'API
const API_BASE_URL = window.location.origin;

// Éléments DOM
const scanBtn = document.getElementById('scan-btn');
const cancelCameraBtn = document.getElementById('cancel-camera-btn');
const captureBtn = document.getElementById('capture-btn');
const retakeBtn = document.getElementById('retake-btn');
const processBtn = document.getElementById('process-btn');
const resetBtn = document.getElementById('reset-btn');
const refreshBtn = document.getElementById('refresh-btn');

const cameraContainer = document.getElementById('camera-container');
const previewContainer = document.getElementById('preview-container');
const initialControls = document.getElementById('initial-controls');
const ocrResult = document.getElementById('ocr-result');
const ocrLoading = document.getElementById('ocr-loading');
const carteForm = document.getElementById('carte-form');
const cartesList = document.getElementById('cartes-list');

const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const previewImage = document.getElementById('preview-image');

let stream = null;
let capturedImage = null;

/**
 * Initialisation de l'application
 */
document.addEventListener('DOMContentLoaded', () => {
    // Charger les cartes au démarrage
    loadCartes();

    // Event listeners
    scanBtn.addEventListener('click', startCamera);
    cancelCameraBtn.addEventListener('click', stopCamera);
    captureBtn.addEventListener('click', captureImage);
    retakeBtn.addEventListener('click', retakePhoto);
    processBtn.addEventListener('click', processOCR);
    resetBtn.addEventListener('click', resetScanner);
    refreshBtn.addEventListener('click', loadCartes);
    carteForm.addEventListener('submit', saveCarte);

    // Vérifier si le service worker est supporté
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/service-worker.js')
            .then(reg => console.log('Service Worker enregistré'))
            .catch(err => console.log('Erreur Service Worker:', err));
    }
});

/**
 * Démarrer la caméra
 */
async function startCamera() {
    try {
        // Demander l'accès à la caméra
        stream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: 'environment', // Caméra arrière sur mobile
                width: { ideal: 1280 },
                height: { ideal: 720 }
            }
        });

        video.srcObject = stream;
        cameraContainer.classList.remove('hidden');
        initialControls.classList.add('hidden');
        previewContainer.classList.add('hidden');
        ocrResult.classList.add('hidden');

        showNotification('Caméra activée', 'success');
    } catch (error) {
        console.error('Erreur d\'accès à la caméra:', error);
        showNotification('Impossible d\'accéder à la caméra. Vérifiez les permissions.', 'error');
    }
}

/**
 * Arrêter la caméra
 */
function stopCamera() {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
    }
    video.srcObject = null;
    cameraContainer.classList.add('hidden');
    initialControls.classList.remove('hidden');
}

/**
 * Capturer une image depuis la vidéo
 */
function captureImage() {
    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);

    // Convertir en image
    capturedImage = canvas.toDataURL('image/jpeg');

    // Afficher l'aperçu
    previewImage.src = capturedImage;
    previewContainer.classList.remove('hidden');
    cameraContainer.classList.add('hidden');

    // Arrêter la caméra
    stopCamera();
}

/**
 * Reprendre la photo
 */
function retakePhoto() {
    previewContainer.classList.add('hidden');
    ocrResult.classList.add('hidden');
    startCamera();
}

/**
 * Traiter l'image avec OCR
 */
async function processOCR() {
    if (!capturedImage) {
        showNotification('Aucune image à analyser', 'error');
        return;
    }

    ocrLoading.classList.remove('hidden');
    carteForm.classList.add('hidden');
    ocrResult.classList.remove('hidden');

    try {
        showNotification('Analyse OCR en cours...', 'success');

        // Convertir data URL en blob pour Tesseract
        const response = await fetch(capturedImage);
        const blob = await response.blob();

        // Initialiser Tesseract
        const { data: { text } } = await Tesseract.recognize(blob, 'fra+eng', {
            logger: m => {
                if (m.status === 'recognizing text') {
                    console.log(`Progression: ${Math.round(m.progress * 100)}%`);
                }
            }
        });

        console.log('Texte extrait:', text);

        // Extraire les informations (logique basique)
        const extractedData = extractInfoFromText(text);

        // Remplir le formulaire
        document.getElementById('nom').value = extractedData.nom || '';
        document.getElementById('prenom').value = extractedData.prenom || '';
        document.getElementById('numero-assurance').value = extractedData.numeroAssurance || '';
        document.getElementById('assureur').value = extractedData.assureur || '';

        ocrLoading.classList.add('hidden');
        carteForm.classList.remove('hidden');

        showNotification('Analyse terminée. Vérifiez et corrigez les informations si nécessaire.', 'success');

    } catch (error) {
        console.error('Erreur OCR:', error);
        ocrLoading.classList.add('hidden');
        showNotification('Erreur lors de l\'analyse OCR', 'error');
    }
}

/**
 * Extraire les informations du texte OCR
 * Cette fonction utilise des patterns simples pour extraire les données
 * Dans un vrai projet, on utiliserait des regex plus sophistiquées ou du NLP
 */
function extractInfoFromText(text) {
    const data = {
        nom: '',
        prenom: '',
        numeroAssurance: '',
        assureur: ''
    };

    // Nettoyer le texte
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);

    // Chercher un numéro d'assurance (souvent 13 chiffres ou format spécifique)
    const numeroMatch = text.match(/\b\d{13,15}\b/);
    if (numeroMatch) {
        data.numeroAssurance = numeroMatch[0];
    }

    // Chercher des mots-clés d'assureurs
    const assureurs = ['CPAM', 'CNAM', 'MSA', 'MGEN', 'HARMONIE', 'MUTUELLE'];
    for (const assureur of assureurs) {
        if (text.toUpperCase().includes(assureur)) {
            data.assureur = assureur;
            break;
        }
    }

    // Chercher des noms/prénoms (mots en majuscules, souvent au début)
    // Pattern simple : 2-3 mots en majuscules consécutifs
    const namePattern = /\b([A-ZÉÈÊËÀÁÂ][A-ZÉÈÊËÀÁÂ\s]{2,30})\b/g;
    const nameMatches = text.match(namePattern);
    if (nameMatches && nameMatches.length >= 2) {
        data.nom = nameMatches[0].trim();
        data.prenom = nameMatches[1].trim();
    } else if (nameMatches && nameMatches.length === 1) {
        // Si un seul nom trouvé, le mettre en nom
        data.nom = nameMatches[0].trim();
    }

    return data;
}

/**
 * Enregistrer la carte dans la base de données
 */
async function saveCarte(event) {
    event.preventDefault();

    const formData = {
        nom: document.getElementById('nom').value.trim(),
        prenom: document.getElementById('prenom').value.trim(),
        numeroAssurance: document.getElementById('numero-assurance').value.trim(),
        assureur: document.getElementById('assureur').value.trim()
    };

    // Validation côté client
    if (!formData.nom || !formData.prenom || !formData.numeroAssurance || !formData.assureur) {
        showNotification('Veuillez remplir tous les champs', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/cartes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            const result = await response.json();
            showNotification('Carte enregistrée avec succès !', 'success');
            resetScanner();
            loadCartes(); // Recharger la liste
        } else {
            const error = await response.json();
            showNotification(error.error || 'Erreur lors de l\'enregistrement', 'error');
        }
    } catch (error) {
        console.error('Erreur:', error);
        showNotification('Erreur de connexion au serveur', 'error');
    }
}

/**
 * Charger la liste des cartes depuis l'API
 */
async function loadCartes() {
    cartesList.innerHTML = '<div class="loading"><div class="spinner"></div><p>Chargement...</p></div>';

    try {
        const response = await fetch(`${API_BASE_URL}/api/cartes`);
        
        if (!response.ok) {
            throw new Error('Erreur de récupération');
        }

        const cartes = await response.json();

        if (cartes.length === 0) {
            cartesList.innerHTML = '<div class="empty-state"><p>Aucune carte enregistrée pour le moment.</p></div>';
            return;
        }

        cartesList.innerHTML = cartes.map(carte => createCarteCard(carte)).join('');
    } catch (error) {
        console.error('Erreur:', error);
        cartesList.innerHTML = '<div class="empty-state"><p>Erreur lors du chargement des cartes.</p></div>';
    }
}

/**
 * Créer une carte HTML pour une carte d'assurance
 */
function createCarteCard(carte) {
    const date = new Date(carte.dateEnregistrement);
    const dateStr = date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    return `
        <div class="carte-item">
            <div class="carte-item-header">
                <div class="carte-item-name">${carte.prenom} ${carte.nom}</div>
                <div class="carte-item-date">${dateStr}</div>
            </div>
            <div class="carte-item-details">
                <div class="carte-item-detail">
                    <strong>Numéro d'assurance</strong>
                    ${carte.numeroAssurance}
                </div>
                <div class="carte-item-detail">
                    <strong>Assureur</strong>
                    ${carte.assureur}
                </div>
            </div>
        </div>
    `;
}

/**
 * Réinitialiser le scanner
 */
function resetScanner() {
    capturedImage = null;
    previewContainer.classList.add('hidden');
    ocrResult.classList.add('hidden');
    initialControls.classList.remove('hidden');
    carteForm.reset();
}

/**
 * Afficher une notification
 */
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.classList.remove('hidden');

    setTimeout(() => {
        notification.classList.add('hidden');
    }, 3000);
}

