### System information
- **OS Platform and Distribution (e.g., Linux Ubuntu 16.04)**:
- **GNOME version**:
- **Exact command to reproduce**:

You can obtain the GNOME version by:
1. Open the Activities overview and start typing About.
2. Click on About to open the panel. A window appears showing information about your system, including your distribution's name and the GNOME version.

### Describe the problem
Describe the problem here, including the steps to reproduce the problem.

### Source code / logs 
Include any logs or source code that would be helpful to diagnose the problem. 
You can view gnome shell extension's log via:
```
journalctl /usr/bin/gnome-shell -r
```
To view logs dynamically:
```
journalctl /usr/bin/gnome-shell -f
```
