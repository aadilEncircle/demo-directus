# Directus on Upsun

This is a production-ready Directus CMS deployment configuration for [Upsun](https://upsun.com/).

## 🚀 Quick Start

### Prerequisites

- [Upsun CLI](https://docs.upsun.com/gettingstarted/installation.html) installed
- Docker and Docker Compose (for local testing)
- Node.js 18+ (for local development)

### Installation

```bash
# Install dependencies
npm install

# Validate environment variables
npm run validate

# Start locally with Docker
docker-compose up -d

# Or start with Directus directly
npm run start
```

### Deployment to Upsun

```bash
# Push to Upsun
upsun push

# Or deploy from local changes
upsun deploy
```

## 📁 Project Structure

```
directus-upsun/
├── .upsun/
│   └── config.yaml          # Upsun application configuration
├── extensions/
│   └── elasticsearch/       # Custom Elasticsearch indexing hook
│       ├── src/
│       │   └── index.js     # Hook implementation
│       └── package.json
├── uploads/                 # File uploads storage
├── .env                     # Environment variables (create from .env.example)
├── .env.example             # Environment template
├── validate-env.js          # Environment validation script
├── package.json             # Node.js dependencies and scripts
└── README.md               # This file
```

## ⚙️ Configuration

### Environment Variables

Create a `.env` file from the template:

```bash
cp .env.example .env
```

#### Required Variables

```env
# Database Configuration
DB_CLIENT=pg
DB_HOST=db
DB_PORT=5432
DB_DATABASE=directus
DB_USER=your_db_user
DB_PASSWORD=your_secure_password

# Security
DIRECTUS_SECRET=your-random-secret-key-min-32-chars

# Admin Account
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your-secure-password

# URLs and Ports
DIRECTUS_PORT=8055
PUBLIC_URL=https://your-project.upsun.app
```

#### Optional Variables

```env
# Caching (Redis required)
CACHE_ENABLED=true
CACHE_AUTO_PURGE=true
CACHE_STORE=redis
REDIS=redis://redis:6379

# Elasticsearch Integration (if using the extension)
ELASTICSEARCH_NODE=http://localhost:9200
ELASTICSEARCH_INDEX=directus_items
ELASTICSEARCH_USERNAME=
ELASTICSEARCH_PASSWORD=

# CORS
CORS_ENABLED=true
CORS_ORIGIN=*

# Security
REFRESH_TOKEN_COOKIE_SECURE=true
SESSION_COOKIE_SECURE=true
```

## 🔧 Services

### PostgreSQL 16

- **Type**: postgresql:16
- **Disk**: 2GB
- **Usage**: Primary database for Directus

### Redis 7

- **Type**: redis:7
- **Disk**: 256MB
- **Usage**: Caching and session storage

### Directus Application

- **Runtime**: Node.js 20
- **Port**: 8055 (configurable)
- **Extensions**: Custom hooks and interfaces

## 🪝 Custom Extensions

### Elasticsearch Indexing Hook

This project includes a custom hook that automatically indexes Directus items in Elasticsearch.

**Features:**
- ✅ Auto-index on create/update/delete
- ✅ Batch operations support
- ✅ Configurable collections to index
- ✅ SSL verification options
- ✅ Connection testing

**Configuration:**

```env
# Enable Elasticsearch
ELASTICSEARCH_NODE=http://your-elasticsearch-server:9200
ELASTICSEARCH_INDEX=your_index_name

# Optional: Authentication
ELASTICSEARCH_USERNAME=elastic
ELASTICSEARCH_PASSWORD=your_password

# Optional: SSL verification
ELASTICSEARCH_VERIFY_SSL=false

# Optional: Limit to specific collections (comma-separated)
INDEXED_COLLECTIONS=articles,products,users
```

**Hook Events:**
- `items.create` - Index new items
- `items.update` - Re-index updated items
- `items.delete` - Remove from index
- `items.batch_*` - Batch operations support

## 🧪 Local Development

### Docker Setup

Create a `docker-compose.yml` for local testing:

```yaml
version: '3.8'

services:
  db:
    image: postgis/postgis:16-master
    environment:
      POSTGRES_USER: directus
      POSTGRES_PASSWORD: directus
      POSTGRES_DB: directus
    ports:
      - "5432:5432"

  redis:
    image: redis:7
    ports:
      - "6379:6379"

  directus:
    image: directus/directus:11.14.0
    ports:
      - "8055:8055"
    depends_on:
      - db
      - redis
    environment:
      DB_CLIENT: pg
      DB_HOST: db
      DB_PORT: 5432
      DB_DATABASE: directus
      DB_USER: directus
      DB_PASSWORD: directus
      CACHE_ENABLED: true
      CACHE_STORE: redis
      REDIS: redis://redis:6379
    volumes:
      - ./uploads:/directus/uploads
      - ./extensions:/directus/extensions
```

Run with:

```bash
docker-compose up -d
```

## 📚 Documentation

- [Directus Documentation](https://docs.directus.io/)
- [Upsun Documentation](https://docs.upsun.com/)
- [Directus Extensions](https://docs.directus.io/extensions/introduction/)

## 🐛 Troubleshooting

### Database Connection Issues

```bash
# Check database status
upsun relationships

# View database logs
upsun logs -s db
```

### Extension Not Loading

```bash
# Check extension logs
upsun logs -s directus | grep -i extension

# Verify extensions are built
npm run build
```

### Performance Issues

```bash
# Check Redis cache status
upsun relationships

# View resource usage
upsun resource
```

## 📝 License

This project is configured for Upsun deployment with Directus CMS.

## 🤝 Support

For issues with:
- **Directus**: [Directus GitHub Issues](https://github.com/directus/directus/issues)
- **Upsun**: [Upsun Support](https://upsun.com/support/)
- **Extensions**: Check the `extensions/` directory for specific documentation
