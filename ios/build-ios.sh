#!/usr/bin/env bash
# Genera el archivo .ipa de HidroCalc listo para App Store Connect.
# Requiere una Mac con Xcode, XcodeGen y una cuenta del Apple Developer Program.
#   TEAM_ID  -> identificador del equipo de desarrollador (10 caracteres)
set -euo pipefail
cd "$(dirname "$0")"
: "${TEAM_ID:?Define TEAM_ID con el identificador de tu equipo de Apple}"

echo "==> Generando el proyecto de Xcode"
xcodegen generate

echo "==> Archivando (compilación Release para dispositivos iOS)"
xcodebuild -project HidroCalc.xcodeproj -scheme HidroCalc -configuration Release \
  -destination 'generic/platform=iOS' -archivePath build/HidroCalc.xcarchive \
  DEVELOPMENT_TEAM="$TEAM_ID" -allowProvisioningUpdates archive

echo "==> Exportando el .ipa firmado con el certificado de distribución"
xcodebuild -exportArchive -archivePath build/HidroCalc.xcarchive \
  -exportOptionsPlist ExportOptions.plist -exportPath build/ipa \
  DEVELOPMENT_TEAM="$TEAM_ID" -allowProvisioningUpdates

echo "==> Listo: build/ipa/HidroCalc.ipa (súbelo con Transporter o desde el Organizer de Xcode)"
