# 🧪 Git Memories Testing Guide

This guide helps you test all authentication scenarios for the git-memories package.

## 🚀 Quick Test Commands

### Complete Reset (Nuclear Option)

```bash
./test/test-reset.sh
```

### OAuth Testing Setup

```bash
./test/test-oauth-setup.sh
```

### View Authentication Logs

```bash
./test/view-logs.sh
```

## 🔐 Authentication Testing Scenarios

### 1. OAuth Flow Testing

**Goal**: Test the full OAuth flow with your GitHub App

**Setup**:

```bash
# 1. Reset everything
./test/test-reset.sh

# 2. Set up OAuth credentials
cp .env.example .env
# Edit .env with your GitHub App credentials

# 3. Set up for OAuth testing
./test/test-oauth-setup.sh

# 4. Test in different directory
cd ~/Desktop
git-memories
```

**Expected Flow**:

1. ✅ "Opening GitHub in your browser..."
2. ✅ Browser opens to GitHub OAuth page
3. ✅ User authorizes the app
4. ✅ Redirects to localhost callback
5. ✅ "Authentication successful! ✅"
6. ✅ Fetches real contributions

### 2. GitHub CLI Testing

**Goal**: Test GitHub CLI authentication fallback

**Setup**:

```bash
# 1. Reset everything
./test/test-reset.sh

# 2. Authenticate with GitHub CLI
gh auth login

# 3. Build and install
npm run build && npm pack
npm install -g git-memories-*.tgz

# 4. Test in different directory
cd ~/Desktop
git-memories
```

**Expected Flow**:

1. ✅ "OAuth not configured. Falling back to manual token setup."
2. ✅ "Using GitHub CLI authentication..."
3. ✅ "GitHub CLI authentication successful! ✅"
4. ✅ Fetches real contributions

### 3. Manual Token Testing

**Goal**: Test manual token creation flow

**Setup**:

```bash
# 1. Reset everything
./test/test-reset.sh

# 2. Disable GitHub CLI
gh auth logout

# 3. Don't create .env file (no OAuth)

# 4. Build and install
npm run build && npm pack
npm install -g git-memories-*.tgz

# 5. Test in different directory
cd ~/Desktop
git-memories
```

**Expected Flow**:

1. ✅ "OAuth not configured. Falling back to manual token setup."
2. ✅ "GitHub CLI not available"
3. ✅ "Create a new GitHub Personal Access Token"
4. ✅ User creates token manually
5. ✅ "Authentication successful! ✅"
6. ✅ Fetches real contributions

### 4. Mock Data Testing

**Goal**: Test mock data scenarios without authentication

**Setup**:

```bash
# 1. Build and install
npm run build && npm pack
npm install -g git-memories-*.tgz

# 2. Test different scenarios
cd ~/Desktop
git-memories --test           # Default mock data
git-memories --auth-setup     # Auth setup scenario
git-memories --no-entries     # No contributions scenario
```

## 🛠️ Development Testing

### Local Development

```bash
# Build and test locally
npm run build
node dist/index.js --test

# Or with ts-node
npx ts-node src/index.ts --test
```

### Package Testing

```bash
# Create package
npm pack

# Install in different directory
cd ~/Desktop
npm install -g /path/to/git-memories-*.tgz

# Test
git-memories --test
```

## 📋 Authentication Logging

All authentication attempts are automatically logged to help with debugging:

### Log Location

- **Development**: `test/logs/git-memories-YYYY-MM-DD.log`
- **Production**: `~/.config/git-memories/logs/git-memories-YYYY-MM-DD.log`

### Log Contents

- OAuth flow steps and errors
- GitHub CLI authentication attempts
- Token exchange responses
- User information retrieval
- Configuration checks

### View Logs

```bash
# Interactive log viewer
./test/view-logs.sh

# Or view directly
cat test/logs/git-memories-*.log
```

### Log Levels

- **INFO**: Normal flow steps
- **WARN**: Non-critical issues (GitHub CLI not available)
- **ERROR**: Authentication failures
- **DEBUG**: Detailed request/response data

## 🔍 Debugging Tips

### Check Authentication Status

```bash
# Check stored tokens
ls -la ~/.config/git-memories/

# Check GitHub CLI status
gh auth status

# Check environment variables
echo $GITHUB_CLIENT_ID
echo $GITHUB_CLIENT_SECRET
```

### Common Issues

**"OAuth not configured"**:

- Check .env file exists and has correct credentials
- Verify GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET are set

**"GitHub CLI authentication failed"**:

- Run `gh auth login` to authenticate
- Or run `gh auth logout` to disable GitHub CLI

**"Authentication failed"**:

- Check your GitHub App settings
- Verify redirect URI matches your app configuration
- Check if your app has the right permissions

## 📝 Test Checklist

Before publishing a new version:

- [ ] OAuth flow works end-to-end
- [ ] GitHub CLI fallback works
- [ ] Manual token creation works
- [ ] Mock data scenarios work
- [ ] Package installs globally without errors
- [ ] All authentication methods store tokens correctly
- [ ] Token expiration handling works
- [ ] Logout functionality works

## 🎯 Testing Strategy

1. **Start with OAuth** (most common user path)
2. **Test GitHub CLI fallback** (easiest for users)
3. **Test manual token** (fallback for edge cases)
4. **Test mock scenarios** (for demos and testing)

This ensures your package works for all user scenarios! 🚀
