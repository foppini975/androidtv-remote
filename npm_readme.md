# Installation

Navigate to the root directory of the cloned project (where the package.json file is located), and run the following command:

```bash
npm install
```

This command will read the package.json file and install all the dependencies listed in it.
If you want to install the dependencies and also save them to your package.json file (in case it doesn't already list them), you can use:

```bash
npm install --save
```

# Uninstallation

To uninstall all packages required for the project, you can use the following npm command:

```bash
npm uninstall
```

However, this command alone might not remove all packages. For a more thorough cleanup, you can follow these steps:

1. Delete the node_modules folder:

- On Unix-based systems (Linux, macOS):

```bash
rm -rf node_modules
```

- On Windows (in Command Prompt):

```bash
rmdir /s /q node_modules
```

2. Delete the package-lock.json file:

- On Unix-based systems:

```bash
rm package-lock.json
```

- On Windows:

```bash
del package-lock.json
```

3. Clear the npm cache:

```bash
npm cache clean --force
```

If you want to remove the dependencies from your package.json file as well, you'll need to edit it manually and remove the entries under "dependencies" and "devDependencies".

# Audit

When you encounter warnings about vulnerabilities during package installation, it's important to address them. Here are the steps you can take:

1. First, run an npm audit to get more details about the vulnerabilities:

```bash
npm audit
```

This will provide information about the vulnerabilities, including their severity and affected packages.

2. To automatically fix the issues that npm can address, run:

```bash
npm audit fix
```

This command will update vulnerable packages to non-vulnerable versions if possible.

3. For more severe vulnerabilities that can't be fixed automatically, use:

```bash
npm audit fix --force
```

Be cautious with this command as it may introduce breaking changes.

4. If the above steps don't resolve all issues, you may need to manually update specific packages or find alternative packages without vulnerabilities.

5. For a detailed report in JSON format, which can be useful for further analysis, use:

```bash
npm audit --json
```

6. Keep in mind that some vulnerabilities might be in dependencies of your direct dependencies. In such cases, you may need to wait for the maintainers of those packages to update their dependencies.

7. Regularly running npm update can help keep your packages up to date and potentially avoid some vulnerabilities.

Remember, while it's important to address vulnerabilities, you should also consider the impact of updates on your project's functionality. Always test your application after applying fixes.
