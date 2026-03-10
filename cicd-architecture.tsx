import { useState } from "react";

const TABS = ["アーキテクチャ図", "フロー詳細", "必要なAWSリソース", "GitHub Actions設定"];

function ArchDiagram() {
  return (
    <div className="p-4 font-sans text-sm">
      <h2 className="text-lg font-bold mb-4 text-center text-gray-700">CI/CD アーキテクチャ図</h2>

      <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">

        {/* GitHub */}
        <div className="flex justify-center mb-2">
          <div className="bg-gray-800 text-white rounded-xl px-6 py-3 text-center w-80 shadow-lg">
            <div className="font-bold text-base">🐙 GitHub Repository</div>
            <div className="text-xs opacity-80 mt-1">foresta-asama (main / develop)</div>
            <div className="flex justify-center gap-3 mt-2">
              <span className="bg-gray-600 rounded px-2 py-0.5 text-xs">push</span>
              <span className="bg-gray-600 rounded px-2 py-0.5 text-xs">pull_request</span>
            </div>
          </div>
        </div>

        {/* Arrow down */}
        <div className="flex justify-center mb-1"><div className="w-px h-5 bg-gray-500"/></div>
        <div className="flex justify-center mb-2"><span className="text-xs text-gray-500">GitHub Actions Trigger</span></div>
        <div className="flex justify-center mb-2"><div className="w-px h-4 bg-gray-500"/></div>

        {/* GitHub Actions */}
        <div className="flex justify-center mb-2">
          <div className="bg-green-700 text-white rounded-xl px-4 py-3 w-96 shadow-lg">
            <div className="font-bold text-center mb-2">⚙️ GitHub Actions</div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-green-600 rounded-lg p-2 text-xs text-center">
                <div className="font-semibold">① Test & Lint</div>
                <div className="opacity-80">単体テスト</div>
                <div className="opacity-80">コード品質チェック</div>
              </div>
              <div className="bg-green-600 rounded-lg p-2 text-xs text-center">
                <div className="font-semibold">② Build Trigger</div>
                <div className="opacity-80">AWS CodeBuild</div>
                <div className="opacity-80">を起動・待機</div>
              </div>
              <div className="bg-green-600 rounded-lg p-2 text-xs text-center">
                <div className="font-semibold">③ ECS Deploy</div>
                <div className="opacity-80">Task Definition更新</div>
                <div className="opacity-80">ECS Service更新</div>
              </div>
              <div className="bg-green-600 rounded-lg p-2 text-xs text-center">
                <div className="font-semibold">④ Notify</div>
                <div className="opacity-80">Slack / Email</div>
                <div className="opacity-80">デプロイ結果通知</div>
              </div>
            </div>
          </div>
        </div>

        {/* OIDC */}
        <div className="flex justify-center mb-1">
          <div className="text-xs text-blue-600 bg-blue-50 border border-blue-200 rounded px-3 py-1">
            🔐 OIDC認証（アクセスキー不要）→ IAM Role assumed
          </div>
        </div>

        {/* Arrows to AWS */}
        <div className="flex justify-center gap-16 mt-2 mb-1">
          <div className="w-px h-5 bg-gray-400 mx-auto"/>
          <div className="w-px h-5 bg-gray-400 mx-auto"/>
        </div>
        <div className="flex justify-center gap-8 mb-2 text-xs text-gray-500">
          <span>start-build API</span>
          <span>update-service API</span>
        </div>

        {/* AWS Resources */}
        <div className="flex gap-3 justify-center mb-3">

          {/* CodeBuild */}
          <div className="bg-indigo-100 border border-indigo-300 rounded-xl p-3 text-center w-44">
            <div className="font-bold text-indigo-700 text-xs mb-1">🔨 AWS CodeBuild</div>
            <div className="text-xs text-indigo-600">foresta-asama-frontend-build</div>
            <div className="text-xs text-indigo-600 mt-1">foresta-asama-backend-build</div>
            <div className="mt-2 text-xs text-gray-500">Dockerfile ビルド</div>
            <div className="text-xs text-gray-500">ECR push</div>
            <div className="mt-1 bg-indigo-50 rounded p-1 text-xs text-indigo-500">
              public.ecr.aws使用
            </div>
          </div>

          {/* ECR */}
          <div className="bg-orange-100 border border-orange-300 rounded-xl p-3 text-center w-44">
            <div className="font-bold text-orange-700 text-xs mb-1">📦 Amazon ECR</div>
            <div className="text-xs text-orange-600">foresta-asama-frontend</div>
            <div className="text-xs text-orange-600 mt-1">foresta-asama-backend</div>
            <div className="mt-2 text-xs text-gray-500">:latest タグ</div>
            <div className="text-xs text-gray-500">または :sha-xxxxxx タグ</div>
          </div>

          {/* ECS */}
          <div className="bg-purple-100 border border-purple-300 rounded-xl p-3 text-center w-44">
            <div className="font-bold text-purple-700 text-xs mb-1">🐳 Amazon ECS</div>
            <div className="text-xs text-purple-600">foresta-asama-cluster</div>
            <div className="mt-1 text-xs text-purple-500">▸ frontend service</div>
            <div className="text-xs text-purple-500">▸ backend service</div>
            <div className="mt-2 text-xs text-gray-500">Rolling Update</div>
            <div className="text-xs text-gray-500">(Blue-Greenなし)</div>
          </div>
        </div>

        {/* Branch Strategy */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mt-2">
          <div className="font-bold text-yellow-700 text-xs mb-2 text-center">🌿 ブランチ戦略</div>
          <div className="flex gap-3 justify-center">
            <div className="bg-white border border-yellow-300 rounded-lg p-2 text-xs text-center w-36">
              <div className="font-semibold text-yellow-700">develop ブランチ</div>
              <div className="text-gray-500 mt-1">push → Test + Build</div>
              <div className="text-gray-500">ECR push のみ</div>
              <div className="text-red-400 mt-1">ECS deploy なし</div>
            </div>
            <div className="bg-white border border-green-300 rounded-lg p-2 text-xs text-center w-36">
              <div className="font-semibold text-green-700">main ブランチ</div>
              <div className="text-gray-500 mt-1">push → Test + Build</div>
              <div className="text-gray-500">ECR push + </div>
              <div className="text-green-600 font-semibold">ECS deploy ✅</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FlowDetail() {
  const flows = [
    {
      step: "1", title: "GitHub push", icon: "🐙",
      color: "bg-gray-100 border-gray-300",
      details: [
        "開発者が feature/* ブランチで開発",
        "develop / main ブランチへのpush or PR merge をトリガー",
        "GitHub Actions ワークフロー起動"
      ]
    },
    {
      step: "2", title: "Test & Lint", icon: "🧪",
      color: "bg-blue-50 border-blue-200",
      details: [
        "Frontend: npm test / ESLint",
        "Backend: pytest / flake8",
        "失敗時はパイプラインを停止"
      ]
    },
    {
      step: "3", title: "CodeBuild 起動", icon: "🔨",
      color: "bg-indigo-50 border-indigo-200",
      details: [
        "GitHub Actions から aws codebuild start-build コマンド実行",
        "既存の foresta-asama-frontend-build / backend-build を使用",
        "ビルド完了まで GitHub Actions がポーリング待機（最大10分）",
        "ECRへ :latest + :git-sha タグでpush"
      ]
    },
    {
      step: "4", title: "ECS Deploy（mainのみ）", icon: "🚀",
      color: "bg-green-50 border-green-200",
      details: [
        "aws ecs register-task-definition でTask Definitionを更新（新イメージタグ）",
        "aws ecs update-service でサービス更新（Rolling Update）",
        "デプロイ完了まで待機（aws ecs wait services-stable）"
      ]
    },
    {
      step: "5", title: "通知", icon: "🔔",
      color: "bg-yellow-50 border-yellow-200",
      details: [
        "成功/失敗をSlackまたはメールで通知",
        "デプロイ先URL・コミットSHAを記載"
      ]
    }
  ];

  return (
    <div className="p-4 font-sans text-sm">
      <h2 className="text-lg font-bold mb-4 text-gray-700">パイプライン フロー詳細</h2>
      <div className="space-y-3">
        {flows.map((f) => (
          <div key={f.step} className={`border rounded-xl p-3 ${f.color}`}>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-gray-700 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">{f.step}</span>
              <span className="text-lg">{f.icon}</span>
              <span className="font-bold text-gray-700">{f.title}</span>
            </div>
            <ul className="list-disc pl-6 space-y-0.5">
              {f.details.map((d, i) => <li key={i} className="text-gray-600 text-xs">{d}</li>)}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

function AWSResources() {
  const resources = [
    { category: "IAM（新規）", name: "foresta-asama-github-actions-role", detail: "GitHub Actions OIDC用IAM Role / CodeBuild・ECS・ECR権限", status: "🆕 作成必要" },
    { category: "IAM（新規）", name: "GitHub OIDC Provider", detail: "token.actions.githubusercontent.com", status: "🆕 作成必要" },
    { category: "CodeBuild（既存）", name: "foresta-asama-frontend-build", detail: "既存流用 / BuildSpecのみ修正（git sha タグ対応）", status: "✅ 既存流用" },
    { category: "CodeBuild（既存）", name: "foresta-asama-backend-build", detail: "既存流用 / BuildSpecのみ修正（git sha タグ対応）", status: "✅ 既存流用" },
    { category: "ECR（既存）", name: "foresta-asama-frontend / backend", detail: "既存流用 / :latest + :git-sha タグで管理", status: "✅ 既存流用" },
    { category: "ECS（既存）", name: "foresta-asama-cluster", detail: "既存流用 / Rolling Updateで更新", status: "✅ 既存流用" },
    { category: "SSM Parameter（新規）", name: "/foresta-asama/ecr-uri-frontend", detail: "GitHub ActionsからECR URIを参照するためのパラメータ", status: "🔵 オプション" },
  ];

  return (
    <div className="p-4 font-sans text-sm">
      <h2 className="text-lg font-bold mb-4 text-gray-700">必要なAWSリソース</h2>
      <table className="w-full border-collapse text-xs">
        <thead>
          <tr className="bg-gray-100">
            <th className="text-left p-2 border border-gray-200">カテゴリ</th>
            <th className="text-left p-2 border border-gray-200">リソース名</th>
            <th className="text-left p-2 border border-gray-200">詳細</th>
            <th className="text-left p-2 border border-gray-200">ステータス</th>
          </tr>
        </thead>
        <tbody>
          {resources.map((r, i) => (
            <tr key={i} className="hover:bg-gray-50">
              <td className="p-2 border border-gray-200 font-semibold text-gray-600">{r.category}</td>
              <td className="p-2 border border-gray-200 font-mono">{r.name}</td>
              <td className="p-2 border border-gray-200 text-gray-500">{r.detail}</td>
              <td className="p-2 border border-gray-200">{r.status}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-3">
        <div className="font-bold text-blue-700 text-xs mb-2">🔐 認証方式：GitHub OIDC（推奨）</div>
        <div className="text-xs text-blue-600 space-y-1">
          <div>✅ AWSアクセスキーをGitHub Secretsに保存不要</div>
          <div>✅ 一時的なトークンで安全にAWSにアクセス</div>
          <div>✅ リポジトリ・ブランチ単位でロールを制限可能</div>
        </div>
      </div>
    </div>
  );
}

function GHActionsConfig() {
  const mainYaml = `name: CI/CD - Foresta Asama

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  AWS_REGION: ap-northeast-1
  ECR_FRONTEND: 508985564091.dkr.ecr.ap-northeast-1.amazonaws.com/foresta-asama-frontend
  ECR_BACKEND:  508985564091.dkr.ecr.ap-northeast-1.amazonaws.com/foresta-asama-backend
  ECS_CLUSTER:  foresta-asama-cluster
  FRONTEND_SERVICE: foresta-asama-frontend
  BACKEND_SERVICE:  foresta-asama-backend

jobs:
  test:
    name: Test & Lint
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run tests (Frontend)
        run: cd frontend && npm ci && npm test
      - name: Run tests (Backend)
        run: cd backend && pip install -r requirements.txt && pytest

  build:
    name: Build & Push to ECR
    needs: test
    runs-on: ubuntu-latest
    permissions:
      id-token: write  # OIDC用
      contents: read
    steps:
      - uses: actions/checkout@v4
      
      - name: Configure AWS credentials (OIDC)
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::508985564091:role/foresta-asama-github-actions-role
          aws-region: \${{ env.AWS_REGION }}

      - name: Trigger CodeBuild - Frontend
        id: frontend-build
        run: |
          BUILD_ID=$(aws codebuild start-build \\
            --project-name foresta-asama-frontend-build \\
            --environment-variables-override \\
              name=IMAGE_TAG,value=\${{ github.sha }} \\
            --query 'build.id' --output text)
          echo "build_id=$BUILD_ID" >> $GITHUB_OUTPUT

      - name: Trigger CodeBuild - Backend
        id: backend-build
        run: |
          BUILD_ID=$(aws codebuild start-build \\
            --project-name foresta-asama-backend-build \\
            --environment-variables-override \\
              name=IMAGE_TAG,value=\${{ github.sha }} \\
            --query 'build.id' --output text)
          echo "build_id=$BUILD_ID" >> $GITHUB_OUTPUT

      - name: Wait for builds to complete
        run: |
          aws codebuild wait build-complete \\
            --ids "\${{ steps.frontend-build.outputs.build_id }}" \\
                  "\${{ steps.backend-build.outputs.build_id }}"

  deploy:
    name: Deploy to ECS
    needs: build
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    permissions:
      id-token: write
      contents: read
    steps:
      - uses: actions/checkout@v4

      - name: Configure AWS credentials (OIDC)
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::508985564091:role/foresta-asama-github-actions-role
          aws-region: \${{ env.AWS_REGION }}

      - name: Deploy Frontend to ECS
        uses: aws-actions/amazon-ecs-deploy-task-definition@v1
        with:
          task-definition: foresta-asama-frontend
          service: \${{ env.FRONTEND_SERVICE }}
          cluster: \${{ env.ECS_CLUSTER }}
          image: \${{ env.ECR_FRONTEND }}:\${{ github.sha }}
          container-name: frontend
          wait-for-service-stability: true

      - name: Deploy Backend to ECS
        uses: aws-actions/amazon-ecs-deploy-task-definition@v1
        with:
          task-definition: foresta-asama-backend
          service: \${{ env.BACKEND_SERVICE }}
          cluster: \${{ env.ECS_CLUSTER }}
          image: \${{ env.ECR_BACKEND }}:\${{ github.sha }}
          container-name: backend
          wait-for-service-stability: true`;

  return (
    <div className="p-4 font-sans text-sm">
      <h2 className="text-lg font-bold mb-3 text-gray-700">GitHub Actions ワークフロー（設計案）</h2>
      <div className="text-xs text-gray-500 mb-2">📁 .github/workflows/cicd.yml</div>
      <pre className="bg-gray-900 text-green-300 text-xs rounded-xl p-4 overflow-auto max-h-96 leading-relaxed whitespace-pre">{mainYaml}</pre>

      <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-3">
        <div className="font-bold text-amber-700 text-xs mb-2">⚠️ 実装前に必要な対応</div>
        <ul className="text-xs text-amber-600 list-disc pl-4 space-y-1">
          <li>GitHub OIDC Provider を AWS IAM に登録（CloudFormationで自動化可）</li>
          <li>foresta-asama-github-actions-role を作成（CodeBuild・ECS・ECR権限付与）</li>
          <li>CodeBuild の BuildSpec を IMAGE_TAG 環境変数対応に修正</li>
          <li>GitHubリポジトリ名を role の Condition に設定</li>
        </ul>
      </div>
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState(0);
  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-gray-800 to-green-700 p-4 text-white">
        <h1 className="text-xl font-bold">🚀 Terrace Villa Foresta Asama — CI/CD アーキテクチャ設計</h1>
        <p className="text-sm opacity-80 mt-1">GitHub Actions + AWS CodeBuild + Amazon ECS（Rolling Update）</p>
      </div>
      <div className="flex border-b border-gray-200 overflow-x-auto">
        {TABS.map((t, i) => (
          <button key={i} onClick={() => setTab(i)}
            className={`px-5 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${tab === i ? "border-green-500 text-green-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
            {t}
          </button>
        ))}
      </div>
      <div className="overflow-auto" style={{maxHeight: "600px"}}>
        {tab === 0 && <ArchDiagram />}
        {tab === 1 && <FlowDetail />}
        {tab === 2 && <AWSResources />}
        {tab === 3 && <GHActionsConfig />}
      </div>
    </div>
  );
}
