uv venv
.\.venv\Scripts\Activate.ps1
uv pip install -e "libs/kotaemon[all]"
uv pip install -e "libs/ktem"
#to-do: create a single "uv pip install -r requirements.txt" file
python app.py