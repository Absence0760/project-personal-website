+++
title = "Using multiple git profiles"
date = 2026-03-19
[taxonomies]
tags = ["git", "ssh", "tooling"]
+++

### Files to create

## First File (~/.gitconfig)

```bash
[user]
    name = profile1
    email = profile1@gmail.com

[includeIf "gitdir:~/path/to/folder1"]
    path = ~/.gitconfig-profile1

[includeIf "gitdir:~/path/to/folder2"]
    path = ~/.gitconfig-profile2
```

## Second file (~/.gitconfig-profile2)

```txt
[user]
    name = profile2_username
    email = profile2@gmail.com
```

## Third file (~/.gitconfig-profile3)

```txt
[user]
    name = profile3_username
    email = profile3@gmail.com
```

## SSH Keys

For each profile, generate an SSH key and add it to the corresponding GitHub account. See [GitHub's guide on adding a new SSH key](https://docs.github.com/en/enterprise-cloud@latest/authentication/connecting-to-github-with-ssh/adding-a-new-ssh-key-to-your-github-account).

## SSH Setup (~/.ssh/config)

```txt
Host bitbucket.org
  HostName bitbucket.org
  User git
  IdentityFile ~/.ssh/ssh_profile1

Host github.com
  HostName github.com
  User git
  IdentityFile ~/.ssh/ssh_profile2

Host github-profile3
  HostName github.com
  User git
  IdentityFile ~/.ssh/ssh_profile3
```

## Cloning with profile3

Substitute the normal `github.com` host with the alias `github-profile3` defined in `~/.ssh/config`. That alias maps to `github.com` but uses `~/.ssh/ssh_profile3` for auth.

```bash
git clone git@github-profile3:USERNAME/REPO.git
```
