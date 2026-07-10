export default function Disclaimer() {
  return (
    <aside
      style={{
        border: "1px solid var(--sl-color-orange)",
        background:
          "color-mix(in srgb, var(--sl-color-orange) 12%, transparent)",
        borderRadius: "0.5rem",
        padding: "1rem 1.25rem",
        margin: "1.5rem 0",
      }}
    >
      <p style={{ margin: 0, fontWeight: 600 }}>免责声明</p>
      <p style={{ margin: "0.5rem 0 0", fontSize: "var(--sl-text-sm)" }}>
        本站内容仅供学习与参考，不构成任何投资建议或金融产品推荐。文中提及的银行、券商及产品均为虚构示例。
        请在做出任何财务决策前咨询持牌专业人士，并自行核实产品条款。
      </p>
    </aside>
  );
}
