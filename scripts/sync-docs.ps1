# Script to sync Markdown files into Docusaurus

# Paths
$docsDir = "$PSScriptRoot/../docs"
$srcDir = "$PSScriptRoot/.."
$docusaurusDir = "$docsDir/docs"

# Create required directories if they don't exist
$directories = @(
    "$docusaurusDir/getting-started",
    "$docusaurusDir/guides",
    "$docusaurusDir/api"
)

foreach ($dir in $directories) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }
}

# Function to copy and process markdown files
function Sync-MarkdownFiles {
    param (
        [string]$sourcePath,
        [string]$targetPath,
        [string]$category = ""
    )

    Get-ChildItem -Path $sourcePath -Recurse -Filter "*.md" | ForEach-Object {
        $relativePath = $_.FullName.Substring($srcDir.Length + 1)
        $targetFile = Join-Path $targetPath $relativePath
        $targetDir = Split-Path $targetFile -Parent
        
        # Create target directory if it doesn't exist
        if (-not (Test-Path $targetDir)) {
            New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
        }
        
        # Read content and add frontmatter if needed
        $content = Get-Content $_.FullName -Raw
        
        # Add frontmatter if it doesn't exist
        if (-not ($content -match '^---\r?\n')) {
            $title = [System.IO.Path]::GetFileNameWithoutExtension($_.Name)
            $frontmatter = @"
---
title: $title
sidebar_label: $title
---

"@
            $content = $frontmatter + $content
        }
        
        # Write the processed content
        $content | Out-File -FilePath $targetFile -Encoding utf8NoBOM -Force
        Write-Host "Processed: $relativePath"
    }
}

# Sync main README as introduction
$readmeContent = Get-Content "$srcDir/README.md" -Raw
$frontmatter = @"
---
title: Introduction
slug: /
---

"@
$readmeContent = $frontmatter + $readmeContent
$readmeContent | Out-File "$docusaurusDir/intro.md" -Encoding utf8NoBOM -Force

# Sync docs directory
Sync-MarkdownFiles -sourcePath "$srcDir/docs" -targetPath $docusaurusDir

# Sync src/pages directory
Sync-MarkdownFiles -sourcePath "$srcDir/src/pages" -targetPath "$docusaurusDir/guides"

Write-Host "Documentation sync complete!" -ForegroundColor Green
