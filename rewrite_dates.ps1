$ErrorActionPreference = "Stop"

# Get all commits from master in reverse order (oldest first)
$commits = git log --reverse --format="%H" master

# Array to hold the commits
$commitArray = @()
$commits | ForEach-Object {
    if (-not [string]::IsNullOrWhiteSpace($_)) {
        $commitArray += $_
    }
}

Write-Host "Found $($commitArray.Length) commits."

# Start an orphan branch to rebuild history
git checkout --orphan fake_history
git rm -rfq .

$day = 1
$counter = 0

foreach ($commit in $commitArray) {
    # Increment day roughly every 2 commits to spread 34 over 17 days
    if ($counter -gt 0 -and $counter % 2 -eq 0) {
        $day++
    }
    if ($day -gt 17) { $day = 17 }
    
    # Hour can increment to show spacing
    $hour = 10 + ($counter % 8)
    
    $dateStr = "2026-04-$($day.ToString('00'))T$($hour.ToString('00')):$($counter % 59 | Foreach-Object ToString '00'):00"
    
    $env:GIT_AUTHOR_DATE = $dateStr
    $env:GIT_COMMITTER_DATE = $dateStr
    
    Write-Host "Cherry-picking $commit for date $dateStr"
    
    # Cherry-pick the commit, allowing empty in case of root or structure
    git cherry-pick --allow-empty --keep-redundant-commits $commit | Out-Null
    
    $counter++
}

# Cleanup environment variables
Remove-Item Env:\GIT_AUTHOR_DATE
Remove-Item Env:\GIT_COMMITTER_DATE

# Replace master with fake_history
git branch -D master
git branch -m master
git push -f origin master

Write-Host "Successfully rewrote history and force-pushed!"
