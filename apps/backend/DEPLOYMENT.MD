I tried with uv:
curl -LsSf https://astral.sh/uv/install.sh | sh && source $HOME/.local/bin/env && uv venv && bash -c "source .venv/bin/activate && uv pip install -r requirements.txt"
source .venv/bin/activate && uvicorn main:app --host 0.0.0.0 --port $PORT

# to troubleshoot: create a pyproject.toml (uv pip compile pyproject.toml -o requirements.txt) maybe

with pip:
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port $PORT