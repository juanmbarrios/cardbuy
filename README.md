# TCG Marketplace Platform

A comprehensive trading card game marketplace built as market infrastructure, not as a simple storefront.

## Features

- **Catalog & Taxonomy**: Normalized TCG product catalog
- **Search & Discovery**: Powerful faceted search engine
- **Marketplace**: Multi-vendor cart and checkout
- **Trust & Safety**: Escrow payments and dispute resolution
- **Seller Tools**: Onboarding, inventory management, analytics
- **SEO Optimized**: Server-rendered pages for search engines

## Quick Start

### Prerequisites

- Python 3.11+
- PostgreSQL 15+
- Redis 7+
- Docker & Docker Compose (optional)

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd cardbuy
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. **Start services with Docker Compose**
   ```bash
   docker-compose up -d
   ```

6. **Run database migrations**
   ```bash
   alembic upgrade head
   ```

7. **Start the application**
   ```bash
   python -m src.main
   ```

The API will be available at `http://localhost:8000`

## API Documentation

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`
- Health Check: `http://localhost:8000/health`

## Project Structure

```
cardbuy/
├── src/                    # Source code
│   ├── core/              # Core functionality (auth, DB, models)
│   ├── catalog/           # Catalog management
│   ├── search/            # Search engine
│   ├── marketplace/       # Cart, checkout, payments
│   ├── trust/             # Fraud detection, disputes
│   ├── seller/            # Seller tools and onboarding
│   ├── seo/               # SEO and content management
│   ├── community/         # Community features
│   └── admin/             # Admin panel
├── config/                # Configuration files
├── tests/                 # Test suite
├── docs/                  # Documentation
├── scripts/               # Utility scripts
├── alembic/               # Database migrations
└── requirements.txt       # Python dependencies
```

## Development

### Code Quality

This project follows strict code quality standards:

- **Black**: Code formatting
- **isort**: Import sorting
- **flake8**: Linting
- **mypy**: Type checking

Run quality checks:
```bash
black src/
isort src/
flake8 src/
mypy src/
```

### Testing

```bash
pytest tests/
```

### Database Migrations

Create a new migration:
```bash
alembic revision --autogenerate -m "Description of changes"
```

Apply migrations:
```bash
alembic upgrade head
```

## Deployment

### Docker

Build and run with Docker:
```bash
docker-compose up --build
```

### Production

For production deployment:

1. Set `DEBUG=false` in environment
2. Use a production WSGI server (gunicorn)
3. Configure proper database and Redis instances
4. Set up monitoring and logging
5. Configure HTTPS certificates

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes following the coding standards
4. Add tests for new functionality
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue in this repository
- Check the documentation in `docs/`
- Review the API documentation at `/docs`