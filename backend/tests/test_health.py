import ast
from pathlib import Path


def test_health_endpoint_reports_service_health():
    tree = ast.parse(Path(__file__).parents[1].joinpath("main.py").read_text(encoding="utf-8"))
    route = next(
        node
        for node in tree.body
        if isinstance(node, ast.FunctionDef)
        and any(
            isinstance(decorator, ast.Call)
            and isinstance(decorator.func, ast.Attribute)
            and isinstance(decorator.func.value, ast.Name)
            and decorator.func.value.id == "app"
            and decorator.func.attr == "get"
            and decorator.args
            and isinstance(decorator.args[0], ast.Constant)
            and decorator.args[0].value == "/health"
            for decorator in node.decorator_list
        )
    )

    assert route.name == "health"
    assert any(
        isinstance(node, ast.Return)
        and isinstance(node.value, ast.Dict)
        and len(node.value.keys) == 1
        and isinstance(node.value.keys[0], ast.Constant)
        and node.value.keys[0].value == "status"
        and isinstance(node.value.values[0], ast.Constant)
        and node.value.values[0].value == "ok"
        for node in ast.walk(route)
    )
