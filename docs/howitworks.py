"""Render the ToolDock 'how it works' flowchart.

Run from this directory:  python howitworks.py
Deps:  pip install diagrams cairosvg   (and Graphviz on PATH)
"""
import os
from diagrams import Diagram, Cluster, Edge
from diagrams.custom import Custom

ICONS = os.path.normpath(os.path.join(os.path.dirname(__file__), "..", "..", "_diagram_icons"))


def icon(name: str) -> str:
    return os.path.join(ICONS, f"{name}.png")


graph_attr = {"fontsize": "18", "bgcolor": "white", "pad": "0.4",
              "splines": "spline", "nodesep": "0.5", "ranksep": "0.9"}
node_attr = {"fontsize": "13"}
edge_attr = {"fontsize": "11"}

with Diagram(
    "ToolDock — launcher + self-contained sub-apps",
    filename="howitworks",
    direction="TB",
    show=False,
    graph_attr=graph_attr,
    node_attr=node_attr,
    edge_attr=edge_attr,
):
    launcher = Custom("Bootstrap launcher\nindex.html · launcher.html", icon("bootstrap"))

    with Cluster("Static sub-apps  →  GitHub Pages live demo"):
        audio = Custom("audio-app", icon("html5"))
        csvtool = Custom("csv-analyser", icon("files"))
        hashtool = Custom("hash", icon("javascript"))
        image = Custom("image-analysis", icon("electron"))

    with Cluster("Local-only"):
        sysui = Custom("system-info UI", icon("html5"))
        sysapi = Custom("Express\nserver.js :3000", icon("express"))
        sysui >> Edge(color="#0ea5e9", label="fetch") >> sysapi

    pages = Custom("GitHub Pages\nlive demo", icon("githubactions"))

    launcher >> Edge(color="#10b981") >> audio
    launcher >> Edge(color="#10b981") >> csvtool
    launcher >> Edge(color="#10b981") >> hashtool
    launcher >> Edge(color="#10b981") >> image
    launcher >> Edge(color="#f59e0b", style="dashed") >> sysui

    audio >> Edge(color="#8b5cf6", style="dotted") >> pages
    csvtool >> Edge(color="#8b5cf6", style="dotted") >> pages
    hashtool >> Edge(color="#8b5cf6", style="dotted") >> pages
    image >> Edge(color="#8b5cf6", style="dotted") >> pages
