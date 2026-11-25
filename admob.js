import { Capacitor } from '@capacitor/core';
import { AdMob } from '@capacitor-community/admob';

// IDs de teste oficiais do Google AdMob (trocar pelos reais apenas apos aprovacao)
const TEST_INTERSTITIAL_ID = 'ca-app-pub-3940256099942544/1033173712';
const MORTES_PARA_ANUNCIO = 2;

let admobPronto = false;
let aPrepararOuMostrar = false;
let contadorMortes = 0;

export async function iniciarAdMob() {
  if (!Capacitor.isNativePlatform()) {
    return false;
  }

  if (admobPronto) {
    return true;
  }

  try {
    await AdMob.initialize({
      initializeForTesting: true
    });
    admobPronto = true;
    return true;
  } catch (err) {
    console.warn('Falha ao inicializar AdMob:', err);
    return false;
  }
}

export async function mostrarIntersticial(adId = TEST_INTERSTITIAL_ID) {
  if (aPrepararOuMostrar) {
    return false;
  }

  const pronto = await iniciarAdMob();
  if (!pronto) {
    return false;
  }

  aPrepararOuMostrar = true;
  try {
    await AdMob.prepareInterstitial({
      adId,
      isTesting: true
    });
    await AdMob.showInterstitial();
    return true;
  } catch (err) {
    console.warn('Falha ao exibir intersticial:', err);
    return false;
  } finally {
    aPrepararOuMostrar = false;
  }
}

// Dispara ao concluir um nivel
export async function aoConcluirNivel(adId = TEST_INTERSTITIAL_ID) {
  return mostrarIntersticial(adId);
}

// Soma 1 morte; ao chegar em 2 mortes, exibe o anuncio e zera a contagem
export async function aoMorrerJogador(adId = TEST_INTERSTITIAL_ID) {
  contadorMortes += 1;
  if (contadorMortes >= MORTES_PARA_ANUNCIO) {
    contadorMortes = 0;
    return mostrarIntersticial(adId);
  }
  return false;
}

// Expor funcoes no objeto global caso o jogo use scripts tradicionais sem bundler
if (typeof window !== 'undefined') {
  window.ViceAdMob = {
    iniciarAdMob,
    mostrarIntersticial,
    aoConcluirNivel,
    aoMorrerJogador
  };
}
