$c = Get-Content 'C:\Users\HP\FAQS\faq-system\frontend\src\pages\DiscussionPage.jsx' -Raw
$opens = ([regex]::Matches($c, '{')).Count
$closes = ([regex]::Matches($c, '}')).Count
Write-Host "Open braces: $opens, Close braces: $closes, File size: $($c.Length) chars"