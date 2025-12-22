#!/bin/bash

# SkillForged Multi-Provider AI Setup Checklist
# Run this after implementing the multi-AI system

echo "🚀 SkillForged Multi-Provider AI Setup Checklist"
echo "=================================================="
echo ""

# Check 1: Model Router Exists
echo "✓ Check 1: Verifying model-router.ts exists..."
if [ -f "src/server/ai/model-router.ts" ]; then
    echo "  ✅ model-router.ts found"
else
    echo "  ❌ model-router.ts NOT found"
fi
echo ""

# Check 2: Environment Variables
echo "✓ Check 2: Verifying .env.local configuration..."
if [ -f ".env.local" ]; then
    echo "  ✅ .env.local exists"
    if grep -q "GEMINI_API_KEY" .env.local; then
        echo "  ✅ GEMINI_API_KEY found"
    else
        echo "  ⚠️  GEMINI_API_KEY not found in .env.local"
    fi
    if grep -q "OPENROUTER_API_KEY" .env.local; then
        echo "  ✅ OPENROUTER_API_KEY found"
    else
        echo "  ⚠️  OPENROUTER_API_KEY not found in .env.local"
    fi
else
    echo "  ❌ .env.local not found"
    echo "     Copy env.example to .env.local and add your API keys"
fi
echo ""

# Check 3: Dependencies
echo "✓ Check 3: Checking required dependencies..."
if grep -q "@google/generative-ai" package.json; then
    echo "  ✅ @google/generative-ai installed"
else
    echo "  ❌ @google/generative-ai NOT found"
fi
echo ""

# Check 4: AI Actions Updated
echo "✓ Check 4: Verifying ai-actions.ts uses smart routing..."
if grep -q "smartRoute" src/server/actions/ai-actions.ts; then
    echo "  ✅ ai-actions.ts uses smartRoute"
else
    echo "  ❌ ai-actions.ts doesn't use smartRoute"
fi
echo ""

# Check 5: Generation Actions Updated
echo "✓ Check 5: Verifying generation-actions.ts uses batch processing..."
if grep -q "BATCH_SIZE" src/server/actions/generation-actions.ts; then
    echo "  ✅ generation-actions.ts uses batch processing"
else
    echo "  ❌ generation-actions.ts doesn't use batch processing"
fi
echo ""

# Summary
echo "=================================================="
echo "Setup Instructions:"
echo ""
echo "1. Copy env.example to .env.local:"
echo "   cp env.example .env.local"
echo ""
echo "2. Get Gemini API Key:"
echo "   https://makersuite.google.com/app/apikey"
echo ""
echo "3. Get OpenRouter API Key:"
echo "   https://openrouter.ai/keys"
echo ""
echo "4. Add keys to .env.local:"
echo "   GEMINI_API_KEY=your_key_here"
echo "   OPENROUTER_API_KEY=your_key_here"
echo ""
echo "5. Start dev server:"
echo "   npm run dev"
echo ""
echo "6. Try creating a roadmap and check console for:"
echo "   'Calling X models in parallel...'"
echo ""
echo "=================================================="
