from setuptools import setup, find_packages

setup(
    name="quizito-ai",
    version="2.0.0",
    packages=find_packages(),
    install_requires=[
        "Flask==2.3.3",
        "Flask-CORS==4.0.0",
        "openai>=1.3.0",
        "PyPDF2==3.0.1",
        "python-dotenv==1.0.0",
        "numpy>=1.26.0",
        "pandas>=2.2.0",
        "requests==2.31.0",
        "gunicorn==21.2.0",
    ],
    python_requires=">=3.8",
)
