#!/bin/bash

echo "🚀 Building DurvalCRM Frontend for Production..."

# Clean previous builds
rm -rf dist

# Build for production
NODE_ENV=production npm run build

echo "✅ Build completed!"
echo "📦 Output in dist/ directory"
echo ""
echo "To deploy to WildFly:"
echo "1. Create WAR file: cd dist && jar -cvf ../durvalcrm-frontend.war *"
echo "2. Deploy to WildFly: cp durvalcrm-frontend.war /opt/wildfly/standalone/deployments/"