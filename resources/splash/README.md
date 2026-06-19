# Splash Screen Resources

Ce dossier contient les ressources du splash screen de l’application **Dictionnaire Inzébi**.

## Fichiers

- `splash-base.png` — image source fournie (800 × 480 px)
- `ios/` — images carrées pour iOS / Launch Storyboard
- `android/` — images carrées pour Android drawable

## Format

Fond beige `#EDE4D8`, éléments centraux orange `#D97745`, drapeau du Gabon.
Les images sont générées en mode **CENTER_CROP** pour s’adapter à tous les ratios d’écran.

## Installation dans les projets natifs

Après avoir ajouté les plateformes (`npx cap add ios` et/ou `npx cap add android`), copiez les images dans les dossiers natifs correspondants puis synchronisez (`npx cap sync`).

### iOS

Dans `ios/App/App/Assets.xcassets/Splash.imageset/` :

- `splash-2732x2732.png` → `splash-2732@2x.png`
- `splash-2048x2048.png` → `splash-2048@2x.png`
- `splash-1242x1242.png` → `splash-1242@2x.png`
- etc.

Mettez à jour `Contents.json` pour lister les images et laisser le Launch Storyboard utiliser `Splash`.

### Android

Copiez chaque image dans le dossier `drawable-*` correspondant :

- `splash-2880x2880.png` → `android/app/src/main/res/drawable-xxxhdpi/splash.png`
- `splash-1920x1920.png` → `android/app/src/main/res/drawable-xxhdpi/splash.png`
- `splash-1440x1440.png` → `android/app/src/main/res/drawable-xhdpi/splash.png`
- `splash-960x960.png` → `android/app/src/main/res/drawable-hdpi/splash.png`
- `splash-720x720.png` → `android/app/src/main/res/drawable-mdpi/splash.png`

## Regénérer les ressources

```bash
python3 /tmp/generate-splash.py
```

(Le script source est conservé dans `resources/generate-splash.py`.)
