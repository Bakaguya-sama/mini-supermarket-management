# GitHub Actions CI/CD Setup Guide

## 📋 Tổng quan

Project này đã được cấu hình với 3 GitHub Actions workflows:

1. **CI (Continuous Integration)** - `ci.yml`: Chạy build và test khi có PR hoặc push
2. **CD (Continuous Deployment)** - `deploy.yml`: Deploy production lên Netlify khi merge vào main
3. **PR Preview** - `pr-preview.yml`: Tạo preview deployment cho mỗi Pull Request

## 🚀 Hướng dẫn Setup

### Bước 1: Lấy Netlify Credentials

1. **Đăng nhập vào [Netlify](https://app.netlify.com/)**

2. **Lấy NETLIFY_AUTH_TOKEN:**

   - Vào: User Settings → Applications → Personal Access Tokens
   - Click "New Access Token"
   - Đặt tên token (vd: "GitHub Actions CI/CD")
   - Copy token (chỉ hiện 1 lần, lưu lại!)

3. **Lấy NETLIFY_SITE_ID:**
   - Vào site của bạn trên Netlify
   - Site Settings → General → Site information
   - Copy "Site ID" (hoặc "API ID")

### Bước 2: Thêm Secrets vào GitHub Repository

1. **Vào GitHub repository của bạn:**

   ```
   https://github.com/Bakaguya-sama/mini-supermarket-management
   ```

2. **Vào Settings → Secrets and variables → Actions**

3. **Click "New repository secret" và thêm 2 secrets:**

   **Secret 1:**

   - Name: `NETLIFY_AUTH_TOKEN`
   - Value: [Token bạn copy ở bước 1.2]

   **Secret 2:**

   - Name: `NETLIFY_SITE_ID`
   - Value: [Site ID bạn copy ở bước 1.3]

### Bước 3: Push code lên GitHub

```bash
git add .
git commit -m "chore: setup GitHub Actions CI/CD"
git push origin huy-fe
```

### Bước 4: Tạo Pull Request

1. Tạo PR từ branch `huy-fe` sang `main`
2. GitHub Actions sẽ tự động:
   - Chạy CI để build và test
   - Tạo preview deployment cho PR
   - Comment link preview vào PR

### Bước 5: Merge vào Main

- Khi merge PR vào `main`, workflow `deploy.yml` sẽ tự động deploy lên Netlify production

## 📝 Chi tiết các Workflows

### 1. CI Workflow (`ci.yml`)

**Trigger:** Push hoặc PR vào `main` hoặc `develop`

**Jobs:**

- ✅ Build client (React + Vite)
- ✅ Chạy linter
- ✅ Upload build artifacts
- ✅ Check server (placeholder cho tests sau)

### 2. Deploy Workflow (`deploy.yml`)

**Trigger:** Push vào `main` branch

**Jobs:**

- 🚀 Build client production
- 🚀 Deploy lên Netlify production
- 🚀 Comment deployment status

### 3. PR Preview Workflow (`pr-preview.yml`)

**Trigger:** Mở PR hoặc update PR vào `main`

**Jobs:**

- 👀 Build client
- 👀 Deploy preview lên Netlify
- 👀 Comment preview URL vào PR

## 🔧 Customization

### Thêm Environment Variables

Nếu cần thêm biến môi trường cho build:

```yaml
- name: Build client
  working-directory: ./client
  run: npm run build
  env:
    VITE_API_URL: ${{ secrets.VITE_API_URL }}
    VITE_OTHER_VAR: ${{ secrets.VITE_OTHER_VAR }}
```

Sau đó thêm secrets tương ứng vào GitHub Settings.

### Thêm Tests

Khi có unit tests hoặc e2e tests, thêm vào file `ci.yml`:

```yaml
- name: Run tests
  working-directory: ./client
  run: npm test
```

### Deploy Server (Backend)

Nếu muốn deploy server lên Heroku/Railway/Render, thêm job mới trong `deploy.yml`:

```yaml
deploy-server:
  name: Deploy Server
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    # Add server deployment steps here
```

## 🎯 Best Practices

1. **Branch Protection Rules:**

   - Settings → Branches → Add rule cho `main`
   - ✅ Require pull request reviews
   - ✅ Require status checks (CI phải pass)

2. **Commit Messages:**

   - Sử dụng conventional commits: `feat:`, `fix:`, `chore:`, `docs:`

3. **Testing:**
   - Thêm tests cho components quan trọng
   - CI sẽ tự động chạy tests

## 🐛 Troubleshooting

### Lỗi "NETLIFY_AUTH_TOKEN not found"

- Kiểm tra lại secrets đã được thêm đúng tên chưa
- Secrets phân biệt hoa thường

### Build fail trên CI nhưng local OK

- Kiểm tra Node version (CI dùng Node 18)
- Đảm bảo `package-lock.json` được commit

### Deploy thành công nhưng site bị lỗi

- Kiểm tra build output trong logs
- Verify `netlify.toml` config
- Check browser console cho lỗi runtime

## 📚 Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Netlify Deploy with GitHub Actions](https://github.com/marketplace/actions/netlify-actions)
- [Vite Build Documentation](https://vitejs.dev/guide/build.html)

## ✅ Checklist

- [ ] Lấy NETLIFY_AUTH_TOKEN
- [ ] Lấy NETLIFY_SITE_ID
- [ ] Thêm 2 secrets vào GitHub
- [ ] Push workflows lên GitHub
- [ ] Tạo PR test
- [ ] Verify CI chạy thành công
- [ ] Verify preview deployment hoạt động
- [ ] Merge PR và verify production deployment
- [ ] Setup branch protection rules
